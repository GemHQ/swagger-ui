import React from "react"
import PropTypes from "prop-types"

export default class BaseLayout extends React.Component {

  static propTypes = {
    errSelectors: PropTypes.object.isRequired,
    errActions: PropTypes.object.isRequired,
    specActions: PropTypes.object.isRequired,
    specSelectors: PropTypes.object.isRequired,
    oas3Selectors: PropTypes.object.isRequired,
    oas3Actions: PropTypes.object.isRequired,
    layoutSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired
  }

  onFilterChange =(e) => {
    let {target: {value}} = e
    this.props.layoutActions.updateFilter(value)
  }

  render() {
    let {
      authSelectors,
      specSelectors,
      specActions,
      getComponent,
      layoutSelectors,
      oas3Selectors,
      oas3Actions
    } = this.props

    let info = specSelectors.info()
    let url = specSelectors.url()
    let baseUrl = specSelectors.baseUrl()
    let basePath = specSelectors.basePath()
    let host = specSelectors.host()
    let securityDefinitions = specSelectors.securityDefinitions()
    let externalDocs = specSelectors.externalDocs()
    let schemes = specSelectors.schemes()
    let servers = specSelectors.servers()

    let Info = getComponent("info")
    let Operations = getComponent("operations", true)
    let Models = getComponent("Models", true)
    let AuthorizeBtn = getComponent("authorizeBtn", true)
    let Row = getComponent("Row")
    let Col = getComponent("Col")
    let Servers = getComponent("Servers")
    let Errors = getComponent("errors", true)

    let isLoading = specSelectors.loadingStatus() === "loading"
    let isFailed = specSelectors.loadingStatus() === "failed"
    let filter = layoutSelectors.currentFilter()

    let inputStyle = {}
    if(isFailed) inputStyle.color = "red"
    if(isLoading) inputStyle.color = "#aaa"

    const Schemes = getComponent("schemes")

    let taggedOps = specSelectors.taggedOperations()
    let spec = specSelectors.specStr()

    const isSpecEmpty = (!spec || (spec && taggedOps.size === 0))

    if(isSpecEmpty) {
      return (
        <div/>
      );
    }

    const config = authSelectors.getConfigs();
    const securities = authSelectors
      .definitionsToAuthorize()
      .toJS()

    return (
      <div className='swagger-ui'>
        <div className='swagger-ui-header'>
          <h1>API Documentation</h1>
            <p className={'description'}>
              These authorization values are the ones that swagger-ui is currently using to communicate with GemOS.<br/>
              To change it, please use the ‘Authorize’ button. You can also generate a new set of keys from the Settings page.
            </p>
            <p>
              <strong>Base URL</strong>: { schemes && schemes.size ? schemes.first() : 'http' }://{baseUrl}{basePath} <br/>
            </p>
            <br/>
            {/* !!securities.length && <small>
              * These authorization values are the ones that swagger-ui is currently using to communicate with GemOS.
              <br/>To change it, please use the 'Authorize' button. You can also generate a new set of keys from the Settings page.
             </small> */}
          </div>


          <Row>
            <Col mobile={12} desktop={12} >
              <Operations/>
            </Col>
          </Row>
        </div>
      )
  }
}
