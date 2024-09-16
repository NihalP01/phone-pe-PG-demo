import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import sha256 from 'crypto-js/sha256';

export async function POST(req) {
  try {
    const { mobileNumber, amount } = await req.json();

    const transactionid = 'Tr-' + uuidv4().toString(36).slice(-6);
    const merchantUserId = 'MUID-' + uuidv4().toString(36).slice(-6);

    const payload = {
      merchantId: process.env.NEXT_PUBLIC_MERCHANT_ID,
      merchantTransactionId: transactionid,
      merchantUserId,
      amount: amount * 100,
      // TODO: Change it with your domain
      redirectUrl: `http://localhost:3000/api/status/${transactionid}`,
      redirectMode: 'POST',
      mobileNumber,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const dataPayload = JSON.stringify(payload);
    const dataBase64 = Buffer.from(dataPayload).toString('base64');
    const fullURL =
      dataBase64 + '/pg/v1/pay' + process.env.NEXT_PUBLIC_SALT_KEY;
    const dataSha256 = sha256(fullURL);

    const checksum =
      dataSha256 + '###' + process.env.NEXT_PUBLIC_SALT_INDEX;

    // FIXME:Change this url in production
    const UAT_PAY_API_URL =
      'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

    const response = await fetch(UAT_PAY_API_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
      },
      body: JSON.stringify({ request: dataBase64 }),
    });

    if (!response.ok) {
      throw new Error('Failed to process payment');
    }

    const responseData = await response.json();

    const redirect =
      responseData.data.instrumentResponse.redirectInfo.url;

    return NextResponse.json({
      success: true,
      redirectUrl: redirect,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
