export const getBlogLink = (slug: string) => {
  return `/blog/${slug}`
}

export const getDateStr = date => {
  return new Date(date).toLocaleString('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  })
}

export const postIsPublished = (post: any) => {
  return post.Published === 'Yes'
}

export const normalizeSlug = slug => {
  if (typeof slug !== 'string') return slug

  let startingSlash = slug.startsWith('/')
  let endingSlash = slug.endsWith('/')

  if (startingSlash) {
    slug = slug.substr(1)
  }
  if (endingSlash) {
    slug = slug.substr(0, slug.length - 1)
  }
  return startingSlash || endingSlash ? normalizeSlug(slug) : slug
}

export const postIsReady = (post: any) => {
  return process.env.NODE_ENV !== 'production' || post.Published === 'Yes'
}

export const loadTweet = async url => {
  const tweetId = url.split('/')[5].split('?')[0]
  const res = await fetch(
    `https://api.twitter.com/1/statuses/oembed.json?id=${tweetId}`
  )
  const json = await res.json()
  return json.html
}

export const loadTweets = async page => {
  var tweets = {}
  for (let i = 0; i < page.content.length; i++) {
    const { value } = page.content[i]
    const { type, properties } = value
    if (type == 'tweet') {
      const src = properties.source[0][0]
      tweets[src] = await loadTweet(src)
    }
  }
  return tweets
}

const nonPreviewTypes = new Set(['editor', 'page', 'collection_view'])

export const extractPostPreview = blocks => {
  let dividerIndex = 0
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].value.type === 'divider') {
      dividerIndex = i
      break
    }
  }

  return blocks
    .slice(0, dividerIndex)
    .filter(
      ({ value: { type, properties } }: any) =>
        !nonPreviewTypes.has(type) && properties
    )
    .map((block: any) => block.value.properties.title)
}
