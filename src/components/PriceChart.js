import { Component } from "react";
import { connect } from "react-redux";
import { priceChartLoadedSelector, priceChartSelector } from "../store/selectors";
import Chart from 'react-apexcharts';
import { chartOptions, dummyData } from './PriceChart.config';
import Spinner from './Spinner';

const priceSymbol = (lastPriceChange) => {
  let output
  if(lastPriceChange === '+') {
    output = <span className="text-success">&#9650;</span> // Green up triangle
  } else {
    output = <span className="text-danger">&#9660;</span> // Red down triangle
  }
  return output
}

const renderPriceChart = (priceChart) => {
  return (
    <div className="price-chart">
      <div className="price">
        <h4 className="mb-0 mt-2">NEX/ETH &nbsp; {priceSymbol(priceChart.lastPriceChange)} &nbsp; {priceChart.lastPrice}</h4>
      </div>
      <Chart
        options={chartOptions}
        series={dummyData}
        type='candlestick'
        width='100%'
        height='100%'
      />
    </div>
  )
}

class PriceChart extends Component {
  render() {
    return (
      <div className="card bg-dark text-white">
        <div className="card-header">
          Price Chart
        </div>
        <div className="card-body">
          {this.props.priceChartLoaded ? renderPriceChart(this.props.priceChart) : <Spinner />}
        </div>
      </div>
    )
  }
}


function mapStateToProps(state) {
  return {
    priceChart: priceChartSelector(state),
    priceChartLoaded: priceChartLoadedSelector(state)
  }
}

// Connect function connects the redux store to our app, 
// and allows access to information in component props.
export default connect(mapStateToProps)(PriceChart);
