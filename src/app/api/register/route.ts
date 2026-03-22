import { NextRequest, NextResponse } from "next/server";
import { registrationService } from "@/lib/services/registration.services";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Call the registration service
    const pre_reg_id = await registrationService.registerUser(data);

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      data: { pre_reg_id },
    }, { status: 201 });
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "An error occurred during registration",
    }, { status: 500 });
  }
}
