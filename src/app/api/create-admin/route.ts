import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@/generated/prisma"

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
    try {
        const { email, name } = await request.json()

        if (!email || !name) {
            return NextResponse.json(
                { error: "Email and name are required" },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            // Update existing user to admin
            const updatedUser = await prisma.user.update({
                where: { email },
                data: { role: "ADMIN" }
            })

            return NextResponse.json({
                message: "User updated to admin successfully",
                user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role }
            })
        }

        // Create new admin user
        const adminUser = await prisma.user.create({
            data: {
                email,
                name,
                role: "ADMIN",
                emailVerified: true
            }
        })

        return NextResponse.json({
            message: "Admin user created successfully",
            user: { id: adminUser.id, email: adminUser.email, role: adminUser.role }
        })
    } catch (error) {
        console.error("Error creating admin user:", error)
        return NextResponse.json(
            { error: "Failed to create admin user" },
            { status: 500 }
        )
    }
}

// Only allow in development
export async function GET() {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { error: "This endpoint is only available in development" },
            { status: 403 }
        )
    }

    return NextResponse.json({
        message: "POST to this endpoint with { email, name } to create/update admin user"
    })
}
