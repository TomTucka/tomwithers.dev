import Header from '../components/header'
import ExtLink from '../components/ext-link'

import sharedStyles from '../styles/shared.module.css'
import contactStyles from '../styles/contact.module.css'

import GitHub from '../components/svgs/github'
import Twitter from '../components/svgs/twitter'
import Envelope from '../components/svgs/envelope'
import LinkedIn from '../components/svgs/linkedin'

const contacts = [
  {
    Comp: Twitter,
    alt: 'twitter icon',
    link: 'https://twitter.com/tomtucka',
  },
  {
    Comp: GitHub,
    alt: 'github icon',
    link: 'https://github.com/tomtucka',
  },
  {
    Comp: LinkedIn,
    alt: 'linkedin icon',
    link: 'https://www.linkedin.com/in/tomtucka/',
  },
  {
    Comp: Envelope,
    alt: 'envelope icon',
    link: 'mailto:tomtucka@gmail.com?subject=Hi!',
  },
]

export default () => (
  <>
    <Header titlePre="Home" />
    <div className={sharedStyles.layout}>
      <img
        className={sharedStyles.avatar}
        src="/avatar.png"
        width="200"
        alt="Toms' Photo"
      />
      <h1>Hi, I'm Tom!</h1>
      <h2>
        I'm a british 🇬🇧 <i>cloud infrastructure engineer</i> working for the
        british government.
      </h2>

      <br />

      <div className={contactStyles.links}>
        {contacts.map(({ Comp, link, alt }) => {
          return (
            <ExtLink key={link} href={link} aria-label={alt}>
              <Comp height={24} />
            </ExtLink>
          )
        })}
      </div>
    </div>
  </>
)
