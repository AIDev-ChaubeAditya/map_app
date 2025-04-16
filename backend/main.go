package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"mapapp/handlers"
)

func main() {
	// Serve static files from frontend directory
	fs := http.FileServer(http.Dir("../frontend"))
	http.Handle("/", fs)

	// API routes
	http.HandleFunc("/api/search", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Search endpoint working")
		handlers.SearchHandler(w, r)
	})
	http.HandleFunc("/api/geocode", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Geocode endpoint working")
	})
	http.HandleFunc("/api/directions", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Directions endpoint working")
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("Server running on port %s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
