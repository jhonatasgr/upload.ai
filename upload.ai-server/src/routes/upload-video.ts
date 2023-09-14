import { FastifyInstance } from 'fastify';
import { fastifyMultipart } from '@fastify/multipart'
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'node:fs'
import { pipeline } from 'node:stream';
import { promisify } from 'node:util';
import { prisma } from '../lib/prisma';

const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance){
    app.register(fastifyMultipart, {
        limits: {
            fileSize: 1_048_576 * 25 // 25mb
        }
    })
    app.post('/videos', async (req, reply) => {
       
        const data = await req.file()

        if(!data){
            return reply.status(400).send({error: 'Missing file input.'})
        }

        const  extension = path.extname(data.filename) 

        if(extension !== '.mp3'){
            return reply.status(400).send({error: 'Invalid file extension, api accept only mp3 extension'})
        }

        const fileBaseName  = path.basename(data.filename, extension)
        const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`
        const upLoadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

        await pump(data.file, fs.createWriteStream(upLoadDestination))

        const video = await prisma.video.create({
            data: {
                name: data.filename,
                path: upLoadDestination
            }
            
        })

        return reply.send({video})
    })
}