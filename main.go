package main

import (
	"crypto/tls"
	"fmt"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"io"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"time"
)

func serveFile(path string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		f, err := ioutil.ReadFile(path)
		if err != nil {
			log.Print("Error: ", err)
			http.Error(w, "error while getting desktop.html: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.Write(f)
	}
}

func main() {
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}

	r := mux.NewRouter()

	makeDomainProxy := func(domain string, upstream string) *mux.Router {
		router := r.Host(domain).Subrouter()
		proxyURL, _ := url.Parse(upstream)
		router.PathPrefix("/").Handler(httputil.NewSingleHostReverseProxy(proxyURL))

		return router
	}

	version := "15042217"
	ros := r.Host("prod.ros.rockstargames.com").Subrouter()

	ros.HandleFunc("/scui/v2/desktop", serveFile("desktop.html"))
	ros.HandleFunc("/scui/v2/ext/scui/"+version+"/js/common/jquery-1.7.2.min.js", serveFile("jquery-1.7.2.min.js"))

	// 192.81.241.100 == prod.ros.rockstargames.com
	remote, _ := url.Parse("http://192.81.241.100/scui/mtl/api/")
	proxy := httputil.NewSingleHostReverseProxy(remote)

	ros.PathPrefix("/scui/v2/api/").Handler(http.StripPrefix("/scui/v2/api/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		r.Header.Del("Referer")
		proxy.ServeHTTP(w, r)
	})))

	ros.PathPrefix("/scui/mtl/api/").Handler(http.StripPrefix("/scui/mtl/api/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		r.Header.Del("Referer")
		proxy.ServeHTTP(w, r)
	})))

	global, _ := url.Parse("http://192.81.241.100/")
	globalProxy := httputil.NewSingleHostReverseProxy(global)

	ros.PathPrefix("/").Handler(globalProxy)

	// prod.cloud.rockstargames.com.edgekey.net

	cloud := makeDomainProxy("prod.cloud.rockstargames.com", "http://prod.cloud.rockstargames.com.edgekey.net/")
	//cloud := r.Host("prod.cloud.rockstargames.com").Subrouter()

	globalScui := "/global/ext/scui/"

	cloud.PathPrefix(globalScui + version + "/").Handler(http.StripPrefix(globalScui+version+"/", http.FileServer(http.Dir("./UI/ext/scui/a/"))))
	cloud.PathPrefix(globalScui).Handler(http.StripPrefix(globalScui, http.FileServer(http.Dir("./UI/ext/scui/"))))

	authProd := makeDomainProxy("auth-prod.ros.rockstargames.com", "https://192.81.241.100/")
	_ = authProd

	log.Print("Starting server...")
	cfg := &tls.Config{}

	for _, x := range []string{
		"prod_ros_rockstargames_com",
		"prod_cloud_rockstargames_com",
		"ros_rockstargames_com",
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

	customLogger := func(protocol string) handlers.LogFormatter {
		return func(writer io.Writer, params handlers.LogFormatterParams) {

			statusText := ""
			if params.StatusCode != 200 {
				statusText = "<<<<< !!!!"
			}

			fmt.Fprintln(writer,
				params.TimeStamp.Format(time.RFC3339),
				params.Request.Method,
				protocol+"://"+params.Request.Host+params.Request.URL.String(),
				params.Size,
				params.StatusCode,
				statusText,
			)
		}
	}

	go func() {
		log.Fatal(http.ListenAndServe("127.0.0.1:80", handlers.CustomLoggingHandler(os.Stdout, r, customLogger("http"))))
	}()

	go func() {
		// Lingering server
		l, err := net.Listen("tcp", "127.0.0.1:443")
		if err != nil {
			panic(err)
		}

		for {
			conn, err := l.Accept()
			fmt.Println("Got a connection... but not going to do anything with it")
			if err != nil {
				panic(err)
			}

			_ = conn
		}

	}()


	server := http.Server{
		Addr:      "127.0.0.1:4433",
		Handler:   handlers.CustomLoggingHandler(os.Stdout, r, customLogger("https")),
		TLSConfig: cfg,
	}

	log.Fatal(server.ListenAndServeTLS("", ""))
}
