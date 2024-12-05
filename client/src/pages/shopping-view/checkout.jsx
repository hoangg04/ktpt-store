import Address from "@/components/shopping-view/address";
import img from "../../assets/account.jpg";
import { useDispatch, useSelector } from "react-redux";
import UserCartItemsContent from "@/components/shopping-view/cart-items-content";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createNewOrder } from "@/store/shop/order-slice";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

function ShoppingCheckout() {
	const { cartItems } = useSelector((state) => state.shopCart);
	const { user } = useSelector((state) => state.auth);
	const [currentSelectedAddress, setCurrentSelectedAddress] = useState(null);
	const dispatch = useDispatch();
	const { toast } = useToast();
	const navigate = useNavigate();

	const totalCartAmount =
		cartItems && cartItems.items && cartItems.items.length > 0
			? cartItems.items.reduce(
					(sum, currentItem) =>
						sum +
						(currentItem?.salePrice > 0 ? currentItem?.salePrice : currentItem?.price) *
							currentItem?.quantity,
					0,
			  )
			: 0;

	function handleInitiatePaypalPayment() {
		if (cartItems.length === 0) {
			toast({
				title: "Your cart is empty. Please add items to proceed",
				variant: "destructive",
			});

			return;
		}
		if (currentSelectedAddress === null) {
			toast({
				title: "Please select one address to proceed.",
				variant: "destructive",
			});

			return;
		}

		const orderData = {
			userId: user?.id,
			cartItems: cartItems.items.map((singleCartItem) => ({
				productId: singleCartItem?.productId,
				title: singleCartItem?.title,
				image: singleCartItem?.image,
				price: singleCartItem?.salePrice > 0 ? singleCartItem?.salePrice : singleCartItem?.price,
				quantity: singleCartItem?.quantity,
			})),
			addressId: currentSelectedAddress?._id,
			orderStatus: "pending",
			paymentMethod: "paypal",
			paymentStatus: "pending",
			totalAmount: totalCartAmount,
			orderDate: new Date(),
		};

		dispatch(createNewOrder(orderData)).then((data) => {
			if (data?.payload?.success) {
				navigate(`/shop/account`);
			} else {
				toast({
					title: data.payload.message,
					variant: "destructive",
				});
			}
		});
	}

	return (
		<div className="flex flex-col">
			<div className="relative h-[300px] w-full overflow-hidden">
				<img src={img} className="h-full w-full object-cover object-center" />
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5 p-5">
				<Address
					selectedId={currentSelectedAddress}
					setCurrentSelectedAddress={setCurrentSelectedAddress}
				/>
				<div className="flex flex-col gap-4">
					{cartItems && cartItems.items && cartItems.items.length > 0
						? cartItems.items.map((item, index) => (
								<UserCartItemsContent cartItem={item} key={index} />
						  ))
						: null}
					<div className="mt-8 space-y-4">
						<div className="flex justify-between">
							<span className="font-bold">Total</span>
							<span className="font-bold">${totalCartAmount}</span>
						</div>
					</div>
					<div className="mt-4 w-full">
						<Button onClick={handleInitiatePaypalPayment} className="w-full">
							Checkout with Paypal
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ShoppingCheckout;
