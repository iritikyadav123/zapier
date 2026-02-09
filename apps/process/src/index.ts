import {prisma} from '@repo/db/client'
import {Kafka} from 'kafkajs';
import {kafka_topic} from '@repo/global_variable/variable'
const kafka = new Kafka({
  clientId: 'outbox-processor',
  brokers: ['localhost:9092']
})

async function main() {
    const producer = kafka.producer();
    await producer.connect();

    while(1) {
        const pendingRow = await prisma.zapRunOutbox.findMany({
            where :{},
            take : 10
        })

        producer.send({
            topic : kafka_topic,
            messages : pendingRow.map((item) => ({
                value: item.zapId
            }))
        })

        await prisma.zapRunOutbox.deleteMany({
            where : {
                id : {
                    in: pendingRow.map(x => x.id)
                }
            }
        })
    }

}

main();