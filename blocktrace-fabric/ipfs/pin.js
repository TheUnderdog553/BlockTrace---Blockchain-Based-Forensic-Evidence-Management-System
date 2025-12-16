import { create as createClient } from 'ipfs-http-client'
import fs from 'fs'
import path from 'path'
import process from 'process'

const configPath = new URL('./config.json', import.meta.url)
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))

if (process.argv.length < 3) {
  console.error('Usage: npm run pin -- <filePath>')
  process.exit(64)
}

const targetPath = path.resolve(process.argv[2])
const fileContents = fs.readFileSync(targetPath)

const client = createClient({ url: config.endpoint })
const { cid } = await client.add({ path: path.basename(targetPath), content: fileContents }, { pin: config.pinPolicy === 'recursive' })

console.log(JSON.stringify({ cid: cid.toString(), gateway: `${config.gateway}${cid.toString()}` }, null, 2))
