import { NextResponse } from "next/server";
import { createHash } from "crypto";

const checksig = (signature: string, timestamp: string, nonce: string) => {
  const token = process.env.TOKEN || "";
  const arr = [timestamp, nonce, token].sort();
  const shasum = createHash("sha1");
  arr.forEach((item) => shasum.update(item));
  const hashcode = shasum.digest("hex");
  return hashcode === signature;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  console.log(`Request from: ${req.url}.\nParams: ${searchParams}`);
  const signature = searchParams.get("signature");
  const timestamp = searchParams.get("timestamp");
  const nonce = searchParams.get("nonce");
  const echostr = searchParams.get("echostr");

  if (!signature || !timestamp || !nonce || !echostr) {
    return NextResponse.json(
      { success: false, message: "Invalid Request" },
      { status: 400 }
    );
  }

  if (checksig(signature, timestamp, nonce)) {
    console.log(`echostr: ${echostr}`);
    return new NextResponse(echostr);
  } else {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  console.log(`Request from: ${req.url};\nmethod: ${req.method};\nbody: ${req.body}`);
  const signature = searchParams.get("signature");
  const timestamp = searchParams.get("timestamp");
  const nonce = searchParams.get("nonce");
  const echostr = searchParams.get("echostr");
  // const reqHeaders: HeadersInit = new Headers();
  // reqHeaders.set("Content-Type", "application/json");
  if (!signature || !timestamp || !nonce || !echostr) {
    return NextResponse.json(
      { success: false, message: "Invalid Request" },
      { status: 400 }
    );
  }

  if (!checksig(signature, timestamp, nonce)) {
    return NextResponse.json(
      { success: false, message: "Unauthenticated" },
      { status: 401 }
    );
  }

  const rawbody = req.body;
  return new NextResponse("");

}