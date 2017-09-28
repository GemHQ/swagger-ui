import React from "react"
import PropTypes from "prop-types"
import { Link } from "core/components/layout-utils"

export default class Overview extends React.Component {

  constructor(...args) {
    super(...args)
    this.setTagShown = this._setTagShown.bind(this)
  }

  _setTagShown(showTagId, shown) {
    this.props.layoutActions.show(showTagId, shown)
  }

  showOp(key, shown) {
    let { layoutActions } = this.props
    layoutActions.show(key, shown)
  }

  render() {
    let { specSelectors, layoutSelectors, layoutActions, getComponent } = this.props
    let taggedOps = specSelectors.taggedOperations()
    let loading = specSelectors.specJson().size && !taggedOps.size;

    const Collapse = getComponent("Collapse")

    return (
        <div>
          <h4 className="overview-title">Overview</h4>

          {
            taggedOps.map( (tagObj, tag) => {
              let operations = tagObj.get("operations")

              let showTagId = ["overview-tags", tag]
              let showTag = layoutSelectors.isShown(showTagId, true)
              let toggleShow = ()=> layoutActions.show(showTagId, !showTag)

              return (
                <div key={"overview-"+tag}>


                  <h4 onClick={toggleShow} className="link overview-tag"> {showTag ? "-" : "+"}{tag}</h4>

                  <Collapse isOpened={showTag} animated>
                    {
                      operations.map( op => {
                        let { path, method, id } = op.toObject() // toObject is shallow
                        let showOpIdPrefix = "operations"
                        let showOpId = id
                        let shown = layoutSelectors.isShown([showOpIdPrefix, showOpId])
                        return <OperationLink key={id}
                                              path={path}
                                              method={method}
                                              id={path + "-" + method}
                                              shown={shown}
                                              showOpId={showOpId}
                                              showOpIdPrefix={showOpIdPrefix}
                                              href={`#operation-${showOpId}`}
                                              onClick={layoutActions.show} />
                      }).toArray()
                    }
                  </Collapse>

                </div>
                )
            }).toArray()
          }

          { loading ? <div>
            <h3 style={{ textAlign: 'center', marginTop: '30vh' }}> Loading... </h3>
          </div> : null }
          { !loading && taggedOps.size < 1 ? <div>
            <h3 style={{ textAlign: 'center', marginTop: '30vh' }}> No Resources Types Available.</h3>
            <p style={{ textAlign: 'center' }}>Click <a href="/resources/libraries">here</a> to add resource types</p>
          </div> : null }
        </div>
    )
  }

}

Overview.propTypes = {
  layoutSelectors: PropTypes.object.isRequired,
  specSelectors: PropTypes.object.isRequired,
  layoutActions: PropTypes.object.isRequired,
  getComponent: PropTypes.func.isRequired
}

export class OperationLink extends React.Component {

  constructor(props) {
    super(props)
    this.onClick = this._onClick.bind(this)
  }

  _onClick() {
    let { showOpId, showOpIdPrefix, onClick, shown } = this.props
    onClick([showOpIdPrefix, showOpId], !shown)
  }

  render() {
    let { id, method, shown, href } = this.props

    return (
      <Link href={ href } style={{fontWeight: shown ? "bold" : "normal"}} onClick={this.onClick} className="block opblock-link">
        <div>
          <small className={`bold-label-${method}`}>{method.toUpperCase()}</small>
          <span className="bold-label" >{id}</span>
        </div>
      </Link>
    )
  }

}

OperationLink.propTypes = {
  href: PropTypes.string,
  onClick: PropTypes.func,
  id: PropTypes.string.isRequired,
  method: PropTypes.string.isRequired,
  shown: PropTypes.bool.isRequired,
  showOpId: PropTypes.string.isRequired,
  showOpIdPrefix: PropTypes.string.isRequired
}
