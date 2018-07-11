import os
import datetime
from flask import Flask, jsonify
import pandas as pd
import algorithms

application = Flask(__name__)

@application.route("/calendar")
def serve_calendar_data():
    """
    Returns a list of dictionaries
    [
        {
            "date": DATEHERE,
            "trainings":[
                {
                    "title": TITLE,
                    "time": TIME
                },
            ],
            "travel":[
                {
                    "name": NAME(s),
                    "time": TIME,
                    "type": ARRIVAL | DEPARTURE | VISITOR_ARRIVAL | VISITOR_DEPARTURE
                }
            ]
        }
    ]
    """
    if os.environ.get("GAI_CALENDAR") is None:
        return {}
    else:
        if os.path.isfile(os.environ["GAI_CALENDAR"]):
            data = algorithms.get_denormalized_calendar(os.environ["GAI_CALENDAR"])
            return jsonify(data)
        else:
            return {}

if __name__ == "__main__":
    # NOTE Preferably run this using gunicorn.
    application.run(host="0.0.0.0",port=9000,threaded=True)
