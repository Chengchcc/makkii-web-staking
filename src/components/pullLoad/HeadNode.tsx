
import React from 'react'
import { STATS } from './constants'


interface Iheader {
  loaderState: STATS
}

const header: React.FC<Iheader> = () => {

  return(
    <div className="pull-load-head-default">
      <i/>
    </div>
  )
}
header.defaultProps = {
  loaderState: STATS.init,
}

export default header;