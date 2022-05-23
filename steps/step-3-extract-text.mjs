import { promises as fs } from 'fs'
import { promisify } from 'util'

import globCb from 'glob'
import Queue from 'p-queue'

const glob = promisify(globCb)
const queue = new Queue({ concurrency: 8 })

const files = await glob('transcripts/*.vtt')

files.forEach(filePath => {
    queue.add(async() => {
        console.log(`Extracting text from ${filePath}`)
        const file = await fs.readFile(filePath)
        const outputPath = filePath.replace('.vtt', '.txt')
        const text = file.toString()
        const lines = text.split('\n')
        const textLines = []

        lines.forEach((line, i) => {
            const startsWithLetter = line.match(/^[A-Za-z]/)
            if (i < 4) return
            if (!startsWithLetter) return
            textLines.push(line)
        })

        const body = textLines.join(' ')
        await fs.writeFile(outputPath, body)
    })
})

await queue.onIdle()
console.log(`Text extracted from ${files.length.toLocaleString('en-US')} .vtt files`)