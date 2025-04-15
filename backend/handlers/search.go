package handlers

import (
	"encoding/json"
	"net/http"
)

type SearchResult struct {
	Name     string  `json:"name"`
	Address  string  `json:"address"`
	Lat      float64 `json:"lat"`
	Lng      float64 `json:"lng"`
	Category string  `json:"category"`
}

func searchHandler(w http.ResponseWriter, r *http.Request) {
	// query := r.URL.Query().Get("q")
	// lat := r.URL.Query().Get("lat")

	// lng := r.URL.Query().Get("lng")

	// In a real app, you would call a geocoding API here
	// For demo, we return mock data
	results := []SearchResult{
		{
			Name:     "Central Park",
			Address:  "New York, NY",
			Lat:      40.7829,
			Lng:      -73.9654,
			Category: "park",
		},
		{
			Name:     "Empire State Building",
			Address:  "20 W 34th St, New York, NY",
			Lat:      40.7484,
			Lng:      -73.9857,
			Category: "landmark",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(results)
}
