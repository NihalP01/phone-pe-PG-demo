import { NextResponse } from 'next/server';
import sha256 from 'crypto-js/sha256';
import { checkPaymentStatus } from '@/utils/checkPaymentStatus';

export async function POST(req, res) {
  const data = await req.formData();
  const merchantId = data.get('merchantId');
  const transactionId = data.get('transactionId');
  const st =
    `/pg/v1/status/${merchantId}/${transactionId}` +
    process.env.NEXT_PUBLIC_SALT_KEY;
  const dataSha256 = sha256(st);

  const checksum =
    dataSha256 + '###' + process.env.NEXT_PUBLIC_SALT_INDEX;

  const resDta = await checkPaymentStatus(
    merchantId,
    transactionId,
    checksum
  );

  if (resDta.code === 'PAYMENT_SUCCESS')
    return NextResponse.redirect(
      `http://localhost:3000/success/${transactionId}`,
      {
        status: 301,
      }
    );
  else
    return NextResponse.redirect(
      `http://localhost:3000/failure/${transactionId}`,
      {
        status: 301,
      }
    );
}
