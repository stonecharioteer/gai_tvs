
Vue.use(Buefy.default, {
        defaultIconPack: 'fa',
    })
const upload_config = {
    data() {
        return {
            iDashFiles: []
        }
    },
    methods: {
        deleteDropFile() {
            this.iDashFiles = [];
        },
        upload() {
            const vm = this;
            if (this.iDashFiles != []) {
                var formData = new FormData();
                formData.append("files", this.iDashFiles[0])
                // Need to put username and password too.
                axios.post("/projectman/upload", formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    
                    })
                    .then(function(response) {
                        vm.iDashFiles = [];
                        vm.$snackbar.open(response.data['message']);
                    })
            } else {

            }
        }
    }
}
const app = new Vue(upload_config)

app.$mount('#upload_form')