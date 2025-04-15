package handlers

import (
	"encoding/json"
	"net/http"
)

type DirectionsRequest struct {
	Origin      string `json:"origin"`
	Destination string `json:"destination"`
	Mode        string `json:"mode"` // driving, walking, bicycling
}

type DirectionsResponse struct {
	Routes []Route `json:"routes"`
}

type Route struct {
	Summary  string  `json:"summary"`
	Legs     []Leg   `json:"legs"`
	Overview string  `json:"overview_polyline"` // Encoded polyline
	Distance float64 `json:"distance"`          // in meters
	Duration float64 `json:"duration"`          // in seconds
}

type Leg struct {
	Steps    []Step  `json:"steps"`
	Distance float64 `json:"distance"`
	Duration float64 `json:"duration"`
}

type Step struct {
	Instruction string  `json:"instruction"`
	Distance    float64 `json:"distance"`
	Duration    float64 `json:"duration"`
	Polyline    string  `json:"polyline"`
}

func directionsHandler(w http.ResponseWriter, r *http.Request) {
	var req DirectionsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// In a real app, you would call a directions API here
	// For demo, we return mock data
	response := DirectionsResponse{
		Routes: []Route{
			{
				Summary:  "I-80 W",
				Distance: 5000,
				Duration: 1200,
				Overview: "a~l~Fjk~uOwHJy@P",
				Legs: []Leg{
					{
						Steps: []Step{
							{
								Instruction: "Head northeast on Main St",
								Distance:    100,
								Duration:    60,
								Polyline:    "a~l~Fjk~uOwHJy@P",
							},
						},
					},
				},
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
