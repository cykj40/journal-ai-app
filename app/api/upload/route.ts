import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { getUserFromClerkID } from '@/utils/auth'
import sharp from 'sharp'

export const config = {
    api: {
        bodyParser: false,
    },
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromClerkID()
        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File
        const maxWidth = parseInt(data.get('maxWidth') as string) || 1920
        const quality = parseInt(data.get('quality') as string) || 80

        // Get image adjustments
        const brightness = parseFloat(data.get('brightness') as string) || 100
        const contrast = parseFloat(data.get('contrast') as string) || 100
        const saturation = parseFloat(data.get('saturation') as string) || 100
        const blur = parseFloat(data.get('blur') as string) || 0
        const hue = parseFloat(data.get('hue') as string) || 0
        const sepia = parseFloat(data.get('sepia') as string) || 0

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Create a sharp pipeline for the image
        let pipeline = sharp(buffer)

        // Apply adjustments in order
        if (blur > 0) {
            pipeline = pipeline.blur(blur)
        }

        pipeline = pipeline
            .modulate({
                brightness: brightness / 100,
                saturation: saturation / 100,
                hue: hue // Sharp accepts hue rotation in degrees directly
            })
            .linear(
                contrast / 100, // Multiply
                0 // Offset
            )

        if (sepia > 0) {
            // Simulate sepia effect using color manipulation
            pipeline = pipeline.tint({
                r: 255,
                g: 240,
                b: 192
            }).modulate({
                saturation: sepia / 100
            })
        }

        // Resize and optimize
        const optimizedBuffer = await pipeline
            .resize(maxWidth, null, {
                withoutEnlargement: true,
                fit: 'inside',
            })
            .webp({ quality })
            .toBuffer()

        // Get image metadata
        const metadata = await sharp(optimizedBuffer).metadata()

        // Create a unique filename with .webp extension
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
        const filename = `${user.id}-${uniqueSuffix}.webp`
        const path = join(process.cwd(), 'public', 'uploads', filename)

        // Save the optimized image
        await writeFile(path, optimizedBuffer)

        // Return the URL and dimensions
        return NextResponse.json({
            url: `/uploads/${filename}`,
            width: metadata.width,
            height: metadata.height,
        })
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json(
            { error: 'Error uploading file' },
            { status: 500 }
        )
    }
} 