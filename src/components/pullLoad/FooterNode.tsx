
import React from 'react'
import { STATS } from './constants'


interface Ifooter {
  loaderState: STATS
  hasMore: boolean
}

const footer:React.FC<Ifooter> = props => {
  const {
    loaderState,
    hasMore
  } = props

  const className = `pull-load-footer-default ${hasMore? "" : "nomore"}`

  return(
    <div className={className}>
      {
        loaderState === STATS.loading ? <i/> : ""
      }
    </div>
  )
}
footer.defaultProps = {
  loaderState: STATS.init,
  hasMore: true
}

export default footer