import React, { PureComponent } from "react"
import PropTypes from "prop-types"
import { fromJS, List } from "immutable"
import { getSampleSchema } from "core/utils"

import CodeMirror from 'react-codemirror';
require('codemirror/mode/javascript/javascript');

const NOOP = Function.prototype

export default class ParamBody extends PureComponent {

  static propTypes = {
    param: PropTypes.object,
    onChange: PropTypes.func,
    onChangeConsumes: PropTypes.func,
    consumes: PropTypes.object,
    consumesValue: PropTypes.string,
    fn: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    isExecute: PropTypes.bool,
    specSelectors: PropTypes.object.isRequired,
    pathMethod: PropTypes.array.isRequired
  };

  static defaultProp = {
    consumes: fromJS(["application/json"]),
    param: fromJS({}),
    onChange: NOOP,
    onChangeConsumes: NOOP,
  };

  constructor(props, context) {
    super(props, context)

    this.state = {
      isEditBox: false,
      value: ""
    };
  }

  componentWillMount() {
    this.updateValues.call(this, this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.updateValues.call(this, nextProps)
  }

  componentDidMount () {
    this.editor.codeMirror.setSize(768);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.isEditBox) {
      return false;
    } else {
      return true;
    }
  }

  updateValues = (props) => {
    let { specSelectors, pathMethod, param, isExecute, consumesValue="" } = props
    let parameter = specSelectors ? specSelectors.getParameter(pathMethod, param.get("name")) : {}
    let isXml = /xml/i.test(consumesValue)
    let isJson = /json/i.test(consumesValue)
    let paramValue = isXml ? parameter.get("value_xml") : parameter.get("value")

    if ( paramValue !== undefined ) {
      let val = !paramValue && isJson ? "{}" : paramValue
      this.setState({ value: val })
      this.onChange(val, {isXml: isXml, isEditBox: isExecute})
    } else {
      if (isXml) {
        this.onChange(this.sample("xml"), {isXml: isXml, isEditBox: isExecute})
      } else {
        this.onChange(this.sample(), {isEditBox: isExecute})
      }
    }
  }

  sample = (xml) => {
    let { param, fn:{inferSchema} } = this.props
    let schema = inferSchema(param.toJS())

    return getSampleSchema(schema, xml, {
      includeWriteOnly: true
    })
  }

  onChange = (value, { isEditBox, isXml }) => {
    this.setState({value, isEditBox})
    this._onChange(value, isXml)
  }

  _onChange = (val, isXml) => { (this.props.onChange || NOOP)(this.props.param, val, isXml) }

  handleOnChange = e => {
    const {consumesValue} = this.props
    const isJson = /json/i.test(consumesValue)
    const isXml = /xml/i.test(consumesValue)
    const inputValue = isJson ? e.trim() : e;
    this.onChange(inputValue, {isXml})
  }

  toggleIsEditBox = () => {
    this.setState( state => ({isEditBox: !state.isEditBox}) );
  }

  render() {
    let {
      onChangeConsumes,
      param,
      isExecute,
      specSelectors,
      pathMethod,

      getComponent,
    } = this.props

    const Button = getComponent("Button")
    const TextArea = getComponent("TextArea")
    const ContentType = getComponent("contentType")
    // for domains where specSelectors not passed
    let parameter = specSelectors ? specSelectors.getParameter(pathMethod, param.get("name")) : param
    let errors = parameter.get("errors", List())
    let consumesValue = specSelectors.contentTypeValues(pathMethod).get("requestContentType")
    let consumes = this.props.consumes && this.props.consumes.size ? this.props.consumes : ParamBody.defaultProp.consumes

    let { value, isEditBox } = this.state
    let codeMirrorOptions = {
      onChange: this.handleOnChange,
      options: {
        mode: {
          name: 'javascript',
          json: true
        },
        lineNumbers: true,
        theme: 'gem',
        readOnly: !(isEditBox && isExecute) && 'nocursor',
      },
      value
    };

    return (
      <div className="body-param">
        <CodeMirror ref={(c) => this.editor = c}
          {...codeMirrorOptions} />
        <div className="body-param-options">
          {
            !isExecute ? null
                       : <div className="body-param-edit">
                         </div>
          }
          <label htmlFor="">
            <span>Parameter content type</span>
            <ContentType value={ consumesValue } contentTypes={ consumes } onChange={onChangeConsumes} className="body-param-content-type" />
          </label>
        </div>

      </div>
    )

  }
}
