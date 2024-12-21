import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  reviews: [],
};

export const addReview = createAsyncThunk(
  "/order/addReview",
  async (formdata) => {
    try {
      const response = await axios.post(
        `https://e50d-116-96-110-215.ngrok-free.app/api/shop/review/add`,
        formdata
      );
      return response.data;
    } catch (err) {
      return err.response.data
    }
  }
);

export const getReviews = createAsyncThunk("/order/getReviews", async (id) => {

  try {
    const response = await axios.get(
      `https://e50d-116-96-110-215.ngrok-free.app/api/shop/review/${id}`
    );

    return response.data;
  } catch (err) {
    return err.response.data
  }
});

const reviewSlice = createSlice({
  name: "reviewSlice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getReviews.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reviews = action.payload.data;
      })
      .addCase(getReviews.rejected, (state) => {
        state.isLoading = false;
        state.reviews = [];
      });
  },
});

export default reviewSlice.reducer;
