import getBlogIndex from './getBlogIndex'
import getPageData from './getPageData'

export default async function loadPage(slug, idx, previews) {
  const table = await getBlogIndex(previews, idx)
  if (!(slug in table)) {
    return
  }

  const page = table[slug]
  const pageData = await getPageData(page.id)
  page.content = pageData.blocks

  return page
}
