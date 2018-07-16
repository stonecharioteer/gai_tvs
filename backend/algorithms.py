import logging
import datetime
import pandas as pd

def get_month_day_range(date):
    '''
    For a date 'date' returns the start and end date for the month of 'date'.

    Month with 31 days:
    >>> date = datetime.date(2011, 7, 27)
    >>> get_month_day_range(date)
    (datetime.date(2011, 7, 1), datetime.date(2011, 7, 31))

    Month with 28 days:
    >>> date = datetime.date(2011, 2, 15)
    >>> get_month_day_range(date)
    (datetime.date(2011, 2, 1), datetime.date(2011, 2, 28))
    '''
    import calendar
    cal = calendar.Calendar()
    dates = list(cal.itermonthdates(date.year, date.month))
    first_day = min(dates)
    last_day = max(dates)
    return first_day, last_day


def get_dummy_data():
    '''Returns a list of dictionaries for the dates in the current month.'''
    start, end = get_month_day_range(datetime.date.today())
    date = start
    data = {
        "month": datetime.date.today().replace(day=1).strftime("%B %Y"),
        "data":[]
        }
    while date <= end:
        this_row = data_row = {'training': [], 'travel': [],
                                'date': date.isoformat()}
        data["data"].append(this_row)
    return data


def get_denormalized_calendar(file_path):
    '''
    Returns a list of dictionaries
    [
        {
            'date': DATEHERE,
            'trainings':[
                {
                    'title': TITLE,
                    'time': TIME
                },
            ],
            'travel':[
                {
                    'name': NAME(s),
                    'time': TIME,
                    'type': ARRIVAL | DEPARTURE | VISITOR_ARRIVAL | VISITOR_DEPARTURE
                }
            ]
        }
    ]
    '''
    if float(pd.__version__[:pd.__version__.rfind(".")]) >= 0.21:
        training = pd.read_excel(file_path, sheet_name='training')
        travel = pd.read_excel(file_path, sheet_name='travel')
    else:
        # The argument sheetname was deprecated from pandas version 0.21.0
        training = pd.read_excel(file_path, sheetname='training')
        travel = pd.read_excel(file_path, sheetname='travel')
    start, end = get_month_day_range(datetime.date.today())
    date = start
    data = {
        "month": datetime.date.today().replace(day=1).strftime("%B %Y"),
        "data": []
    }
    while date <= end:
        # denormalize training information from the excel file.
        start_date_condition = [x.date()<=date for x in training['Start Time']]
        end_date_condition = [x.date() >= date for x in training['End Time']]
        # Get all trainings which started on or before today, and end on or after today.
        training_condition = [(x and y) for x, y in zip(
            start_date_condition, end_date_condition)]
        training_df = training.loc[training_condition]
        data_row = {'training': [], 'travel': [],
                    'date': date.isoformat()}
        for ix, row in training_df.iterrows():
            this_row = {
                'title': row['Title'],
                'location': row['Location'] if not pd.isnull(row['Location']) else '-',
            }
            if row['Start Time'].date() == date:
                this_row['time'] = row['Start Time'].time().isoformat()
            if row['End Time'].date() == date:
                this_row['time'] = row['End Time'].time().isoformat()
            data_row['training'].append(this_row)

        # Denormalize travel information from the excel file.
        start_date_condition = [x.date()==date for x in travel['Start Time']]
        end_date_condition = [x.date()==date for x in travel['End Time']]
        travel_condition = [(x or y) for x, y in zip(
            start_date_condition, end_date_condition)]
        travel_df = travel.loc[travel_condition]
        for ix, row in travel_df.iterrows():
            this_row = {
                'name': row['Title'],
            }
            if row['Start Time'].date() == date:
                this_row['time'] = row['Start Time'].time().isoformat()
            elif row['End Time'].date() == date:
                this_row['time'] = row['End Time'].time().isoformat()

            if 'travel to' in row['Title'] or 'departure' in row['Title']:
                this_row['type'] = 'DEPARTURE'
            elif 'return from' in row['Title']:
                this_row['type'] = 'ARRIVAL'
            else:
                if row['Start Time'].date() == date:
                    this_row['type'] = 'VISITOR_ARRIVAL'
                elif row['End Time'].date() == date:
                    this_row['type'] = 'VISITOR_DEPARTURE'
            data_row['travel'].append(this_row)

        data["data"].append(data_row)
        date += datetime.timedelta(days=1)
    
    return data
