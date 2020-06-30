import { Sema } from 'async-sema'
import rpc, { values } from './rpc'
import getTableData from './getTableData'
import { getPostPreview } from './getPostPreview'
import { readFile, writeFile } from '../fs-helpers'
import { BLOG_INDEX_ID, BLOG_INDEX_CACHE } from './server-constants'

export default async function getBlogIndex(
  previews = true,
  collection_index = 0
) {
  let postsTable: any = null
  const useCache = process.env.USE_CACHE === 'true'
  const cacheFile = `${BLOG_INDEX_CACHE}${previews ? '_previews' : ''}`

  if (useCache) {
    try {
      postsTable = JSON.parse(await readFile(cacheFile, 'utf8'))
    } catch (_) {
      /* not fatal */
    }
  }

  if (!postsTable) {
    try {
      const data = await rpc('loadPageChunk', {
        pageId: BLOG_INDEX_ID,
        limit: 999, // TODO: figure out Notion's way of handling pagination
        cursor: { stack: [] },
        chunkNumber: 0,
        verticalColumns: false,
      })

      // Parse table with posts
      const tableBlocks = values(data.recordMap.block).filter(
        (block: any) => block.value.type === 'collection_view'
      )

      if (tableBlocks.length < collection_index) {
        console.warn(
          `Failed to load Notion collection, wanted ${collection_index} but found only ${tableBlocks.length}`
        )
      }

      const tableBlock = tableBlocks[collection_index]
      postsTable = await getTableData(tableBlock, true)
    } catch (err) {
      console.error(
        `Failed to load Notion posts, attempting to auto create table`,
        err
      )
      return {}
    }

    // only get 10 most recent post's previews
    const postsKeys = Object.keys(postsTable).slice(0, 3)

    const sema = new Sema(3, { capacity: postsKeys.length })

    if (previews) {
      await Promise.all(
        postsKeys.map(async postKey => {
          await sema.acquire()
          const post = postsTable[postKey]
          post.preview = post.id
            ? await getPostPreview(postsTable[postKey].id)
            : []
          sema.release()
        })
      )
    }

    if (useCache) {
      writeFile(cacheFile, JSON.stringify(postsTable), 'utf8').catch(e =>
        console.error(e)
      )
    }
  }

  return postsTable
}
