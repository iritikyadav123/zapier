import express, { Request, Response } from 'express';
import {prisma} from '@repo/db/client'

const app = express();
app.use(express.json());


app.post('/hook/catch/:userId/:zapId', async(req:Request, res:Response) => {
    const { userId, zapId } = req.params;
    const metadata = req.body;


    try {
        await prisma.$transaction(async tx => {
            const run = await tx.zapRun.create({
                data : {
                    //@ts-ignore
                    zapId: zapId
                }
            })

            await tx.zapRunOutbox.create({
                data : {
                    //@ts-ignore
                    zapRunId: run.id
                }
            })
        })

        return res.json({
            "msg" : "webhook recieved"
        })

    }catch(err) {
        console.log(err)
    }

})

app.listen(4000)
