import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  addressList: [],
};

export const addNewAddress = createAsyncThunk(
  "/addresses/addNewAddress",
  async (formData) => {
    try {
      const response = await axios.post(
        "https://e50d-116-96-110-215.ngrok-free.app/api/shop/address/add",
        formData
      );

      return response.data;
    } catch (err) {
      return err.response.data;
    }
  }
);

export const fetchAllAddresses = createAsyncThunk(
  "/addresses/fetchAllAddresses",
  async (userId) => {
    try {
      const response = await axios.get(
        `https://e50d-116-96-110-215.ngrok-free.app/api/shop/address/get/${userId}`
      );

      return response.data;
    } catch (err) {
      return err.response.data;
    }
  }
);

export const editaAddress = createAsyncThunk(
  "/addresses/editaAddress",
  async ({ userId, addressId, formData }) => {
    try {
      const response = await axios.put(
        `https://e50d-116-96-110-215.ngrok-free.app/api/shop/address/update/${userId}/${addressId}`,
        formData
      );

      return response.data;
    } catch (error) {
      return error.response.data;
    }
  }
);

export const deleteAddress = createAsyncThunk(
  "/addresses/deleteAddress",
  async ({ userId, addressId }) => {
    try {
      const response = await axios.delete(
        `https://e50d-116-96-110-215.ngrok-free.app/api/shop/address/delete/${userId}/${addressId}`
      );

      return response.data;
    } catch (error) {
      return error.response.data;
    }
  }
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addNewAddress.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addNewAddress.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(addNewAddress.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchAllAddresses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllAddresses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.addressList = action.payload.data;
      })
      .addCase(fetchAllAddresses.rejected, (state) => {
        state.isLoading = false;
        state.addressList = [];
      });
  },
});

export default addressSlice.reducer;
