package main

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"io"
	"io/ioutil"
	"log"
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

func quickProxy(fullUrl string) *httputil.ReverseProxy {
	url, _ := url.Parse(fullUrl)
	return httputil.NewSingleHostReverseProxy(url)
}

func main() {
	http.DefaultTransport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}

	r := mux.NewRouter()

	makeDomainProxy := func(domain string, upstream string, addRoutes func(r *mux.Router)) *mux.Router {
		router := r.Host(domain).Subrouter()

		addRoutes(router)
		router.PathPrefix("/").Handler(quickProxy(upstream))

		return router
	}

	version := "15042217"
	ros := r.Host("prod.ros.rockstargames.com").Subrouter()

	ros.HandleFunc("/scui/v2/desktop", serveFile("./UI/html/desktop.html"))
	ros.PathPrefix("/scui/v2/html/desktop/").Handler(http.StripPrefix("/scui/v2/html/desktop/", http.FileServer(http.Dir("./UI/html/desktop/"))))

	ros.HandleFunc("/scui/v2/ext/scui/"+version+"/js/common/jquery-1.7.2.min.js", serveFile("jquery-1.7.2.min.js"))

	// 192.81.241.100 == prod.ros.rockstargames.com
	proxy := quickProxy("http://192.81.241.100/scui/mtl/api/")

	ros.PathPrefix("/scui/v2/api/").Handler(http.StripPrefix("/scui/v2/api/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		r.Header.Del("Referer")
		proxy.ServeHTTP(w, r)
	})))

	ros.PathPrefix("/scui/mtl/api/").Handler(http.StripPrefix("/scui/mtl/api/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		r.Header.Del("Referer")
		proxy.ServeHTTP(w, r)
	})))

	// prod.cloud.rockstargames.com.edgekey.net

	makeDomainProxy("prod.cloud.rockstargames.com", "http://prod.cloud.rockstargames.com.edgekey.net/", func(r *mux.Router) {
		globalScui := "/global/ext/scui/"

		r.PathPrefix(globalScui + version + "/").Handler(http.StripPrefix(globalScui+version+"/", http.FileServer(http.Dir("./UI/ext/scui/a/"))))
		r.PathPrefix(globalScui).Handler(http.StripPrefix(globalScui, http.FileServer(http.Dir("./UI/ext/scui/"))))
	})

	authProd := makeDomainProxy("auth-prod.ros.rockstargames.com", "https://192.81.241.100/", func(r *mux.Router) {

	})
	_ = authProd

	rgl := makeDomainProxy("rgl.rockstargames.com", "http://104.255.105.53/", func(r *mux.Router) {

		r.HandleFunc("/api/{whatever}/writeerrorlogfile", func(w http.ResponseWriter, r *http.Request) {
			type data struct {
				LogData string `json:"logData"`
			}

			d := &data{}
			u := json.NewDecoder(r.Body)

			if err := u.Decode(d); err != nil {
				panic(err)
			}

			s, _ := url.QueryUnescape(d.LogData)

			log.Println("LogData: ", s)
		})
	})

	rglProxy := quickProxy("http://rgl.rockstargames.com/api/")
	tmp := rglProxy.Director
	rglProxy.Director = func(r *http.Request) {
		r.Host = "rgl.rockstargames.com"
		r.Header.Del("Origin")
		r.Header.Del("Referer")
		tmp(r)
	}

	ros.PathPrefix("/scui/rgl/api/").Handler(http.StripPrefix("/scui/rgl/api/", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("Derp prox")
		rglProxy.ServeHTTP(w, r)
	})))

	_ = rgl

	globalProxy := quickProxy("http://192.81.241.100/")

	ros.PathPrefix("/").Handler(globalProxy)

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

	// Cert locations
	// Once:  PlayGTAV.exe+32AF05
	// Array: socialclub.dll+13A775

	headersOk := handlers.AllowedHeaders([]string{"X-Requested-With"})
	originsOk := handlers.AllowedOrigins([]string{"*"})
	methodsOk := handlers.AllowedMethods([]string{"GET", "HEAD", "POST", "PUT", "OPTIONS"})

	handler := handlers.CORS(headersOk,originsOk, methodsOk)(r)

	go func() {
		log.Println("Starting HTTP server")
		log.Fatal(http.ListenAndServe("127.0.0.1:80", handlers.CustomLoggingHandler(os.Stdout, handler, customLogger("http"))))
	}()

	/*
		func() {
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
	*/

	go func() {

		log.Println("Starting HTTPS server")
		log.Fatal(http.ListenAndServeTLS("127.0.0.1:443", "domaincert.crt", "domaincert.key",
			handlers.CustomLoggingHandler(os.Stdout, handler, customLogger("https")),
		))
	}()

	select {}
}
