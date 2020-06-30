import React from 'react'
import Heading from './heading'
import components from './dynamic'
import ExtLink from './ext-link'
import { textBlock } from '../lib/notion/renderers'
import YouTube from 'react-youtube'
import sharedStyles from '../styles/shared.module.css'

const listTypes = new Set(['bulleted_list', 'numbered_list'])

export default props => {
  let listTagName: string | null = null
  let listLastId: string | null = null
  let listMap: {
    [id: string]: {
      key: string
      isNested?: boolean
      nested: string[]
      children: React.ReactFragment
    }
  } = {}
  let firstDivider = false

  return (
    <>
      {(props.content || []).map((block, blockIdx) => {
        const { value } = block
        const { type, properties, id, parent_id } = value
        const isLast = blockIdx === props.content.length - 1
        const isList = listTypes.has(type)
        let toRender = []

        if (isList) {
          listTagName = components[type === 'bulleted_list' ? 'ul' : 'ol']
          listLastId = `list${id}`

          listMap[id] = {
            key: id,
            nested: [],
            children: textBlock(properties.title, true, id),
          }

          if (listMap[parent_id]) {
            listMap[id].isNested = true
            listMap[parent_id].nested.push(id)
          }
        }

        if (listTagName && (isLast || !isList)) {
          toRender.push(
            React.createElement(
              listTagName,
              { key: listLastId! },
              Object.keys(listMap).map(itemId => {
                if (listMap[itemId].isNested) return null

                const createEl = item =>
                  React.createElement(
                    components.li || 'ul',
                    { key: item.key },
                    item.children,
                    item.nested.length > 0
                      ? React.createElement(
                          components.ul || 'ul',
                          { key: item + 'sub-list' },
                          item.nested.map(nestedId =>
                            createEl(listMap[nestedId])
                          )
                        )
                      : null
                  )
                return createEl(listMap[itemId])
              })
            )
          )
          listMap = {}
          listLastId = null
          listTagName = null
        }

        const renderHeading = (Type: string | React.ComponentType) => {
          toRender.push(
            <Heading key={id}>
              <Type key={id}>{textBlock(properties.title, true, id)}</Type>
            </Heading>
          )
        }

        switch (type) {
          case 'page':
          case 'divider':
            if (!firstDivider) {
              // first divider is the preview one
              firstDivider = true
              break
            }
            toRender.push(<hr />)
            break
          case 'text':
            if (properties) {
              toRender.push(textBlock(properties.title, false, id))
            }
            break
          case 'image':
          case 'video': {
            const source = properties.source[0][0]
            if (
              source.indexOf('youtube') != -1 ||
              source.indexOf('youtu.be') != -1
            ) {
              // TODO: extremely fragile
              toRender.push(<YouTube videoId={source.split('/')[3]} />)
              break
            }

            const { format = {} } = value
            const { block_width } = format
            const baseBlockWidth = 768
            const roundFactor = Math.pow(10, 2)
            // calculate percentages
            const width = block_width
              ? `${Math.round(
                  (block_width / baseBlockWidth) * 100 * roundFactor
                ) / roundFactor}%`
              : '100%'

            const isImage = type === 'image'
            const Comp = isImage ? 'img' : 'video'

            toRender.push(
              <Comp
                key={id}
                src={`/api/asset?assetUrl=${encodeURIComponent(
                  format.display_source as any
                )}&blockId=${id}`}
                controls={!isImage}
                alt={isImage ? 'An image from Notion' : undefined}
                loop={!isImage}
                muted={!isImage}
                autoPlay={!isImage}
                style={{ width }}
              />
            )
            if (properties.caption) {
              toRender.push(
                <div className={sharedStyles.caption}>
                  {textBlock(properties.caption, false, id)}
                </div>
              )
            }
            break
          }
          case 'header':
            renderHeading('h1')
            break
          case 'sub_header':
            renderHeading('h2')
            break
          case 'sub_sub_header':
            renderHeading('h3')
            break
          case 'code': {
            if (properties.title) {
              const content = properties.title[0][0]
              const language = properties.language[0][0]

              toRender.push(
                <components.Code key={id} language={language || ''}>
                  {content}
                </components.Code>
              )
            }
            break
          }
          case 'quote':
            if (properties.title) {
              toRender.push(
                React.createElement(
                  components.blockquote,
                  { key: id },
                  textBlock(properties.title, false, id)
                )
              )
            }
            break
          case 'tweet':
            const src = properties.source[0][0]
            if (src in props.tweets) {
              toRender.push(
                <div dangerouslySetInnerHTML={{ __html: props.tweets[src] }} />
              )
              break
            }
            console.warn(`didnt preload ${src}`)
            break
          case 'embed':
            const href = properties.source[0][0]
            let txt = 'See on website'
            if (
              href.indexOf('speakerdeck') > -1 ||
              href.indexOf('slides') > -1
            ) {
              txt = 'See slides'
            }
            toRender.push(
              <p>
                <ExtLink href={href}>{txt}</ExtLink>
              </p>
            )
            break
          default:
            if (process.env.NODE_ENV !== 'production' && !listTypes.has(type)) {
              console.log('unknown type', type)
            }
            break
        }
        return toRender
      })}
    </>
  )
}
