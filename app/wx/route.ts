import { NextResponse } from 'next/server';
import { createHash } from "crypto";


export async function GET(request: Request) {
  // export async function GET() {
  const { searchParams } = new URL(request.url);
  console.log(`Request from: ${request.url}.\nParams: ${searchParams}`);
  const signature = searchParams.get('signature');
  const timestamp = searchParams.get('timestamp');
  const nonce = searchParams.get('nonce');
  const echostr = searchParams.get('echostr');
  const reqHeaders: HeadersInit = new Headers();
  reqHeaders.set('Content-Type', 'application/json');

  if (!signature || !timestamp || !nonce || !echostr) {
    return NextResponse.json({ success: false, message: "Invalid Request" }, { status: 400 });
  }
  const arr = [timestamp, nonce, echostr].sort();
  const shasum = createHash('sha1');
  arr.forEach(shasum.update);
  const hashcode = shasum.digest('hex');
  if(hashcode === signature) {
    return echostr;
  }

  // const res = await fetch(`https://data.mongodb-api.com/product/${id}`, {
  //   headers: reqHeaders,
  // });
  // const product = await res.json();

  // return NextResponse.json({ product })
  return NextResponse.json({ signature, timestamp, nonce, echostr })
  // return NextResponse.json({hello: "world"});

}
