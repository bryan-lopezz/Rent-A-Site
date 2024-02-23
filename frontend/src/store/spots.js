import { csrfFetch } from "./csrf";
import { createSelector } from 'reselect';

const GET_SPOTS = 'spots/GET_SPOTS';
const GET_SPOT = 'spots/GET_SPOT';
const CREATE_SPOT = 'spots/CREATE_SPOT';
const GET_CURRENT_USER_SPOTS = 'spots/GET_CURRENT_USER_SPOTS';

const getSpots = (spots) => ({
  type: GET_SPOTS,
  spots
})

const getSpot = (spot) => ({
  type: GET_SPOT,
  spot
})

const createSpot = (spot) => ({
  type: CREATE_SPOT,
  spot
})

const getCurrentUserSpots = (spots) => ({
  type: GET_CURRENT_USER_SPOTS,
  spots
})

export const createNewSpot = (spot, images) => async dispatch => {
  console.log("🚀 ~ createNewSpot ~ images:", images)
  console.log('this is the spot:', spot)
  // const { previewImg, imageTwo } = images;
  // console.log("🚀 ~ createNewSpot ~ previewImg:", previewImg)
  const imageUrls = Object.values(images);
  // imageUrls.shift();

  console.log("🚀 ~ createNewSpot ~ imageUrls:", imageUrls)
    // console.log("🚀 ~ createNewSpot ~ body:", spot)
    const response = await csrfFetch('/api/spots', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(spot)
    });

    if(response.status !== 201) {
      throw new Error('Sorry! Spot could not be created.') // test
    }


    if(response.ok) {
      const newSpot = await response.json();

      const newImages = imageUrls.forEach(url => {
        url && (
          csrfFetch(`/api/spots/${newSpot.id}/images`, {
            method: "POST",
            header: { "Content-Type": "application/json" },
            body: JSON.stringify(
              {
                url: url,
                preview: true
              }
            )
          })
        )
      })


    await dispatch(createSpot(newSpot, newImages));
    return newSpot;
    }
};

export const getAllSpots = () => async dispatch => {
  const response = await csrfFetch('/api/spots', {
  });

  const data = await response.json();
  // console.log("🚀 ~ getAllSpots ~ data:", data
  dispatch(getSpots(data));
  return response;
};

export const getSpotDetails = (spotId) => async dispatch => {
  const response = await csrfFetch(`/api/spots/${spotId}`, {
  });

  const data = await response.json();
  // console.log("🚀 ~ getSpotDetails ~ data:", data)

  dispatch(getSpot(data));
  return response;
};

export const getCurrentSpotsThunk = () => async dispatch => {
  const response = await csrfFetch('/api/spots/current')
  const userSpots = await response.json();

  dispatch(getCurrentUserSpots(userSpots))
  return userSpots;
}


function spotsReducer(state = {}, action) {
  switch(action.type) {
    case GET_SPOTS: {
      // console.log("🚀 ~ action.spots:", action.spots)
      const newStateObj = {};
      action.spots.Spots.forEach((spot) => newStateObj[spot.id] = spot)
      return newStateObj;
    }
    case GET_SPOT: {
      const newState = {[action.spot.id]: action.spot};
      // console.log("🚀 ~ action.spot:", action.spot)
      // console.log("🚀 ~ spotsReducer ~ newState:", newState)
      return newState;
    }
    case GET_CURRENT_USER_SPOTS: {
      const newState = {}
      action.spots.Spots.forEach(spot => newState[spot.id] = spot)
      return newState
    }
    case CREATE_SPOT: {
      const newState = {...state, [action.spot.id]: action.spot};
      console.log("🚀 ~ action.spot:", action.spot)
      return newState;
    }
    default:
      return state;
  }
}

export const selectSpots = (state) => state.spots;
export const selectedSpotsArray =
  createSelector(selectSpots, (spots) => Object.values(spots));

export default spotsReducer;