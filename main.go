package main

import (
	"crypto/tls"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
)

func serveFile(path string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		f, err := ioutil.ReadFile(path)
		if err != nil {
			log.Print("Error: ", err)
			http.Error(w, "error while getting desktop.html: " + err.Error(), http.StatusInternalServerError)
			return
		}

		w.Write(f)
	}
}


func main() {
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}

	r := mux.NewRouter()

	version := "15042217"
	ros := r.Host("prod.ros.rockstargames.com").Subrouter()

	ros.HandleFunc("/scui/v2/desktop", serveFile("desktop.html"))
	ros.HandleFunc("/scui/v2/ext/scui/"+version+"/js/common/jquery-1.7.2.min.js", serveFile("jquery-1.7.2.min.js"))

	// 192.81.241.100 == prod.ros.rockstargames.com
	remote, err := url.Parse("http://192.81.241.100/scui/mtl/api/")
	if err != nil {
		log.Panic("unable to parse ros url wtf: ", err)
	}
	proxy := httputil.NewSingleHostReverseProxy(remote)

	ros.PathPrefix("/scui/v2/api/").Handler(http.StripPrefix("/scui/v2/api/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		r.Header.Del("Referer")
		proxy.ServeHTTP(w, r)
	})))

	ros.PathPrefix("/scui/mtl/api/").Handler(http.StripPrefix("/scui/mtl/api/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		r.Header.Del("Referer")
		proxy.ServeHTTP(w, r)
	})))

	cloud := r.Host("prod.cloud.rockstargames.com").Subrouter()

	globalScui := "/global/ext/scui/"

	cloud.PathPrefix(globalScui+version+"/").Handler(http.StripPrefix(globalScui+version+"/", http.FileServer(http.Dir("./UI/ext/scui/a/"))))
	cloud.PathPrefix(globalScui).Handler(http.StripPrefix(globalScui, http.FileServer(http.Dir("./UI/ext/scui/"))))



	log.Print("Starting server...")
	cfg := &tls.Config{}

	for _, x := range []string {
		"prod_ros_rockstargames_com",
		"prod_cloud_rockstargames_com",
	} {
		cert, err := tls.LoadX509KeyPair(
			x+".crt",
			x+".key",
		)
		if err != nil {
			log.Fatal(err)
		}

		cfg.Certificates = append(cfg.Certificates, cert)
	}

	// keep adding remaining certs to cfg.Certificates

	// cfg.BuildNameToCertificate()


	server := http.Server{
		Addr:      "127.0.0.1:443",
		Handler:   handlers.LoggingHandler(os.Stdout, r),
		TLSConfig: cfg,
	}

	log.Fatal(server.ListenAndServeTLS("", ""))
}
