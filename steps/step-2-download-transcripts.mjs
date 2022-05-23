import { exec as execCb } from 'child_process'
import { promises as fs } from 'fs'
import { promisify } from 'util'

import globCb from 'glob'
import Queue from 'p-queue'

const exec = promisify(execCb)
const glob = promisify(globCb)
const hearingsFile = await fs.readFile('./hearings.json')
const hearings = JSON.parse(hearingsFile.toString())

const queue = new Queue({ concurrency: 8 })

const files = await glob('transcripts/*.vtt')

const isInThisSession = hearing => hearing.date.includes('2021') || hearing.date.includes('2022')

hearings.forEach(hearing => {
    if (!isInThisSession(hearing)) return
    queue.add(async() => {
        const { chamber, vtt } = hearing

        if (!vtt) {
            console.log(`🐞  Skipping hearing because there is no VTT URL`, JSON.stringify(hearing))
            return
        }

        const vttSplit = vtt.split('/')
        const vttFileName = vttSplit.pop()
        const exists = files.includes(`transcripts/${chamber}-${vttFileName}`)

        if (exists) {
            console.log(`✅  It looks like ${vttFileName} has already been downloaded`)
        } else {
            console.log(`💾  Downloading from ${vtt}`)
            const outputPath = `transcripts/${chamber}-${vttFileName}`
            const cmd = `curl ${vtt} -o ${outputPath}`
            await exec(cmd)
        }
    })
})

await queue.onIdle()

console.log(`🚀  All done downloading`)