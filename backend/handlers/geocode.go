package handlers

import (
	"encoding/json"
	"net/http"
)

type GeocodeResponse struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

func geocodeHandler(w http.ResponseWriter, r *http.Request) {
	// address := r.URL.Query().Get("address")

	// In a real app, you would call a geocoding API here
	// For demo, we return mock data for New York
	response := GeocodeResponse{
		Lat: 40.7128,
		Lng: -74.0060,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
