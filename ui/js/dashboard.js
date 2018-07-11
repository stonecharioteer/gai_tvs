Vue.use(Buefy.default, {
    defaultIconPack: 'fa',
})
const table_configuration = {
    data() {
        return {
            data: [],
            total: 0,
            loading: false,
            sortField: 'id',
            sortOrder: 'desc',
            defaultSortOrder: 'desc',
            searchItem: "",
            page: 1,
            perPage: 10
        }
    },
    methods: {
            /*
            * Load async data
            */
        loadAsyncData() {
            const params = [
                `ordered_by=${this.sortField}`,
                `per_page=10`,
                `page_no=${this.page}`,
                `search=${this.searchItem}`
            ].join('&')

            this.loading = true
            axios.get(`/projectman/projects?${params}`)
                .then(({ data }) => {
                    // api.themoviedb.org manage max 1000 pages
                    this.data = []
                    let currentTotal = data.total_results
                    if (data.total_results / this.perPage > data.total_pages) {
                        currentTotal = this.perPage * data.total_pages
                    }
                    this.total = currentTotal;
                    data.results.forEach((item) => {
                        this.data.push(item)
                    })
                    this.loading = false
                })
                .catch((error) => {
                    this.data = []
                    this.total = 0
                    this.loading = false
                    throw error
                })
        },
        /*
            * Handle page-change event
            */
        onPageChange(page) {
            this.page = page
            this.loadAsyncData()
        },
        /*
            * Handle sort event
            */
        onSort(field, order) {
            this.sortField = field
            this.sortOrder = order
            this.loadAsyncData()
        },
        /*
            * Type style in relation to the value
            */
        type(value) {
            const number = parseFloat(value)
            if (number < 6) {
                return 'is-danger'
            } else if (number >= 6 && number < 8) {
                return 'is-warning'
            } else if (number >= 8) {
                return 'is-success'
            }
        },
        
        updatemapping(row) {
            // Function to modify the mapping based on actions.
            var mapping = document.getElementById(row.id).value;
            var mappings;
            var success = "";
            const vm = this;
            if (mapping.includes(",")){
                mappings = mapping.split(",");
            } else {
                mappings = [mapping];
            }
            // for each mapping, POST.
            for (i =0; i< mappings.length; i++) {
                axios.post('/projectman/update_mapping', {
                    project_id: row.id,
                    mapping: mapping,
                    mode: "add"
                })
                .then(function(response) {
                    // validate the reponsde and launch snackbar.
                    success = response.data["success"];
                    success_message = success ? 'Successfully mapped' : 'Failed to map'
                    success_type = success ? "is-success" : "is-warning"
                    vm.$snackbar.open({
                        message: `${success_message} ${mapping} to ${row.name}!`,
                        type: success_type,
                        duration: 5000
                    })
                })

                for (var j = 0; j < row.local_project_mapping.length; j++) {
                    if (row.local_project_mapping[j].includes("=")){
                        var site = row.local_project_mapping[j].split("=")[0]
                        if (mapping.indexOf(site) == 0) {
                            // remove the mapping
                            row.local_project_mapping.filter(val => val != row.local_project_mapping[j]);
                        }
                    } else {
                        var site = mapping.split("=")[0];
                        if (row.local_project_mapping[j].indexOf(site) == 0) {
                            // remove the mapping
                            row.local_project_mapping.filter(val => val != row.local_project_mapping[j]);
                        }
                    }
                }
                row.local_project_mapping.push(mapping);
                
            }
            // clear the field.
            document.getElementById(row.id).value = ""

            // console.log(row.local_project_mapping)
        },

        removemapping(mapping, row) {
            // removing the mapping value from the model.
            row.local_project_mapping.filter(val => val != mapping);


            // posting the removal to the API.
            axios.post("/projectman/update_mapping", {
                project_id: row.id,
                mapping: mapping})
                .then(function(response) {
                    success = response.data["success"];
                })
            this.$snackbar.open(`Successfully unmapped ${mapping} from ${row.name}!`);
        }
    },
    filters: {
        /**
            * Filter to truncate string, accepts a length parameter
            */
        truncate(value, length) {
            return value.length > length
                ? value.substr(0, length) + '...'
                : value
        },
        colormapping(value) {
            if (value.indexOf("LOH=") == 0 ) {
                return "is-primary"
            } else if (value.indexOf("CEL=") == 0) {
                return "is-link"
            } else if (value.indexOf("AUB=") == 0) {
                return "is-success"
            } else if (value.indexOf("BRU=") == 0) {
                return "is-warning"
            } else if (value.indexOf("ZUM=") == 0) {
                return "is-danger"
            } else if (value.indexOf("KOP=") == 0) {
                return "is-info"
            } else if (value.indexOf("AME=") == 0) {
                return "is-dark"
            } else {
                return "is-black"
            }
        }
    },
    computed: {
        filteredMappings() {
            // Fix this.
            // console.log(this.data)
            return ["A","B"]
            // return this.data.filter(function (number) { return this.data[number].idash_mappings})
        }
    },
    mounted() {
        this.loadAsyncData()
    }
}
const app = new Vue(table_configuration)

app.$mount('#projects_table')