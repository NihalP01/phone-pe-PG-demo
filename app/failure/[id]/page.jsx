'use client';

import { useParams } from 'next/navigation';
import React from 'react';

const PaymentFailure = () => {
  const { id } = useParams();
  return (
    <div className="text-center mt-10">
      <h1 className="text-2xl font-bold">Payment Success</h1>
      <p className="mt-2">
        Your payment with transaction ID {id} was successful!
      </p>
    </div>
  );
};

export default PaymentFailure;
