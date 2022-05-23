// scrape media urls for hearings
// such as those listed here:
// https://www.senate.ca.gov/media-archive

import { promises as fs } from 'fs'

import * as cheerio from 'cheerio';
import fetch from 'isomorphic-fetch'

async function extract(url, data = []) {
    const [host, ...drop] = url.split('/media-archive')
    console.log(`Fetching data from ${url}`)
    const response = await fetch(url)
    const text = await response.text()
    const $ = cheerio.load(text)

    const next = $('li.pager-next')
    const nextHref = next.find('a').attr('href')
    const table = $('table.views-table')
    const rows = table.find('tbody tr')

    rows.each((rowI, rowEl) => {
        const row = {}
        const cells = $(rowEl).find('td')
        cells.each((cellI, cellEl) => {
            const cell = $(cellEl)
            const trimmed = cell.text().trim()

            if (cellI === 0) {
                row.date = trimmed
            } else if (cellI === 1) {
                row.title = trimmed
            } else if (cellI === 3) {
                row.vtt = cell.find('a').attr('data-vtt')
                row.movie = cell.find('a').attr('href')
            }
            data.push(row)
        })
    })

    if (!nextHref) return data

    return extract(`${host}${nextHref}`, data)
}

const assemblyMediaArchiveUrl = 'https://www.assembly.ca.gov/media-archive'
const senateMediaArchiveUrl = 'https://www.senate.ca.gov/media-archive'

const assemblyHearings = await extract(assemblyMediaArchiveUrl)
const senateHearings = await extract(senateMediaArchiveUrl)

const allHearings = []

assemblyHearings.forEach(hearing => {
    const copy = {
        chamber: 'assembly',
        ...hearing
    }
    const [month, day, year] = hearing.date.split('/')
    copy.date = `${year}-${month}-${day}`

    if (copy.movie) {
        copy.movie = copy.movie.trim()
    }
    allHearings.push(copy)
})

senateHearings.forEach(hearing => {
    const copy = {
        chamber: 'senate',
        ...hearing
    }
    const [month, day, year] = hearing.date.split('/')
    copy.date = `${year}-${month}-${day}`

    if (copy.movie) {
        copy.movie = copy.movie.trim()
    }
    allHearings.push(copy)
})

await fs.writeFile(`./hearings.json`, JSON.stringify(allHearings, null, 2))