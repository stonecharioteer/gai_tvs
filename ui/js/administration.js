// Admin Javascript.
// Use to create projects.

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds.


Vue.use(Buefy.default, {defaultIconPack: 'fa'})
const form_configuration = {
    data() {
        return {
            // initialization
            data: [],
            selected_template: null,
            selected_project: null,
            project_name: "",
            project_description: "",
            project_start_date: new Date(),
            repository_basename: null,
            repositories: [],
            new_projects: [],
            templates: [], // move to data variable
            project_mappings: [],
            project_mappings_data: {
                null: {
                    "description":"",
                    "mapping":[]
                },
                undefined: {
                    "description": "",
                    "mapping": []
                },
                "": {
                    "description": "",
                    "mapping": []
                }

            }, // move to data variable
            repository_host_path: "svn://dllohsr222",
            redmine_hostname: "http://lohsr218", 
            filtered_results: [],
            isFetching: false,
            loading: false
        }
    },
    methods: {
        loadAsyncData() {
                            const loading_component = this.$loading.open();

                            axios.get("/projectman/admin_data")
                                .then(( { data }) => {
                                    this.new_projects = data["new_projects"]
                                    this.templates = data["templates"]
                                    this.project_mappings_data = data["project_mappings"]
                                    this.repository_host_path = data["repository_host_path"]
                                    this.redmine_hostname = data["redmine_hostname"]
                                    this.loading = false
                                    this.repositories = []
                                    loading_component.close()
                                })
        },
        addRepository() {
            if (this.repository_host_path != "") {
                if (this.repository_basename != null) {
                    // TODO: Replace spaces and special characters.
                    // Even better, prevent them in the field.
                    var new_repository = this.repository_host_path 
                                    + "/" 
                                    + this.repository_basename;

                    if (!(this.repositories.includes(new_repository))) {
                        this.repositories.push(new_repository);
                    }
            }
                this.repository_basename = null
            }
            
        },
        removemapping(mapping) {
            this.project_mappings_data[this.project_name]["mapping"] = this.project_mappings_data[this.project_name]["mapping"].filter(val => val != mapping);
        },
        removerepository(repo) {
            this.repositories = this.repositories.filter(val => val != repo);
        },
        cancel(mapping) {
            this.project_name = "";
        },
        create_project() {
            const vm = this;
            if (vm.project_name == "") {
                vm.$snackbar.open({
                    message: `Select a project name before trying to create a project.`,
                    type: "is-danger",
                    position: "is-top",
                    actionText: "OK",
                    indefinite: true,
                    onAction: () => {

                    }

                })
            } else if (vm.selected_template == null) {
                vm.$snackbar.open({
                    message: `Select a template before trying to create a project.`,
                    type: "is-danger",
                    position: "is-top",
                    actionText: "OK",
                    indefinite: true,
                    onAction: () => {

                    }
                })
            } else {
                const loading_component = vm.$loading.open();
                vm.$snackbar.open({
                    message: `Attempting to create a project named ${this.project_name}. This process could take a few seconds. Please wait.`,
                    type: "is-info",
                    position: "is-top",
                    actionText: "OK",
                    indefinite: true,
                    onAction: () => {

                    }
                })
                payload = {
                    project_name: this.project_name,
                    // There could be problems with the project description. Need to figure out how to properly set the description
                    // either from the description value in the dictionary or the json object.
                    project_description: this.project_description == "" ? this.project_mappings_data[this.project_name]["description"] : this.project_description,
                    project_start_date: this.project_start_date,
                    project_template: this.selected_template,
                    repositories: this.repositories,
                    project_mappings: this.project_mappings_data[this.project_name]["mapping"],
                    utc_correction: (new Date()).getTimezoneOffset()/60
                }
                axios.post("/projectman/create_project", payload)
                    .then(function (response) {
                        // Read the parameters and build a message.
                        loading_component.close()
                        // vm.project_name = ""
                        vm.repositories = []
                        vm.project_description = ""
                        // vm.selected_template = null
                        var success_message;
                        var success = false;
                        if (response.data.project_created == false) {
                            success_message = response.data.project_creation_message;
                            snackbar_type = "is-danger"
                            snackbar_actiontext = "OK"
                        } else if (response.data.project_updated == false) {
                            success_message = response.data.project_updated_message;
                            snackbar_type = "is-danger"
                            snackbar_actiontext = "Go to Project"
                            success = true
                        } else {
                            // project has been created and updated.\
                            success = true
                            success_message = "Created the project successfully."
                            snackbar_type = "is-success"
                            snackbar_actiontext = "Go to Project"
                        }

                        vm.$snackbar.open({
                            message: success_message,
                            type: snackbar_type,
                            position: "is-top",
                            actionText: snackbar_actiontext,
                            indefinite: true,
                            onAction: () => {
                                if (success == true) {
                                    var project_link = `${vm.redmine_hostname}/projects/${response.data.project_id}`;
                                    window.open(project_link);
                                }
                            }

                        })
                    })
                }
        },
        getProjectAsyncData: _.debounce(function () {
                                // function to asynchronously get the matching
                                // projects from the server.
                                // Client side search is too slow.
                                // 
                                const vmi = this
                                vmi.isFetching = true
                                vmi.filtered_results = []
                                axios.post("/projectman/project_async_data", {
                                    "search": this.project_name})
                                    .then(function(response) {
                                        vmi.isFetching = false
                                        response.data.forEach((item) => vmi.filtered_results.push(item))

                                    })
                            }, 5000)
        },
    computed: {
        filteredProjectNames() {
            var results = []
            if (this.project_name == "*") {
                for (project in this.new_projects) {
                    results.push({
                        "name": project, 
                        "mapping": this.new_projects[project]["mapping"],
                        "description": this.new_projects[project]["description"],
                        
                    })
                }
                return results
            } else {
                for (project in this.new_projects) {
                    //
                    if (project.toString().toLowerCase().indexOf(this.project_name.toLowerCase()) >= 0) {
                        // if the global key matches, this is okay
                        results.push({
                            "name": project,
                            "mapping": this.new_projects[project]["mapping"],
                            "description": this.new_projects[project]["description"],

                        })
                    } else {
                        // loop through the local keys also.
                        for (local_key in this.new_projects[project]["mapping"]) {
                            if (local_key.toString().toLowerCase().indexOf(this.project_name.toLowerCase()) >= 0) {
                                // if the local key matches then it's good/
                                results.push({
                                    "name": project,
                                    "mapping": this.new_projects[project]["mapping"],
                                    "description": this.new_projects[project]["description"],

                                })
                            }
                        }
                    }
                }
                return results
                // return this.new_projects.keys.filter((option) => {
                //     return option
                //         .toString()
                //         .toLowerCase()
                //         .indexOf(this.project_name.toLowerCase()) >=0

                // })
            }
        }
    },
    mounted() {
        this.loadAsyncData();
    }

}

const app = new Vue(form_configuration);

app.$mount('#project_form')