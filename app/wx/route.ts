import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  console.log(`Request from: ${req.url}.\nParams: ${searchParams}`);
  const signature = searchParams.get('signature');
  const timestamp = searchParams.get('timestamp');
  const nonce = searchParams.get('nonce');
  const echostr = searchParams.get('echostr');
  const reqHeaders: HeadersInit = new Headers();
  reqHeaders.set('Content-Type', 'application/json');

  // const res = await fetch(`https://data.mongodb-api.com/product/${id}`, {
  //   headers: reqHeaders,
  // });
  // const product = await res.json();

  // return NextResponse.json({ product })
  return NextResponse.json({ signature, timestamp, nonce, echostr })

}
