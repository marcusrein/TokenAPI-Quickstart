import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title
} from 'chart.js';

// Register necessary Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title
);

/**
 * Renders a Pie chart showing the distribution of token values.
 *
 * @param {object} props - Component props.
 * @param {Array<object>} props.balances - The balance data array.
 * @param {number} [props.topN=5] - Number of top tokens to display distinctly.
 */
function BalanceChart({ balances, topN = 5 }) {
  console.log('BalanceChart rendering with balances:', balances);

  if (!balances || balances.length === 0) {
    return null; // Don't render chart if no data
  }


  

  // Filter out tokens without USD value and sort by value descending
  const sortedBalances = balances
    .filter(b => typeof b.value_usd === 'number' && b.value_usd > 0)
    .sort((a, b) => b.value_usd - a.value_usd);

  if (sortedBalances.length === 0) {
    console.log('No balances with positive USD value found for chart.');
    return <p>No token value data available for chart.</p>;
  }

  // Prepare data for the chart
  const labels = [];
  const dataValues = [];
  const backgroundColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#7BC24E', '#E7E9ED'
    // Add more colors if expecting more than topN + 'Other'
  ];

  let otherValue = 0;
  sortedBalances.forEach((balance, index) => {
    if (index < topN) {
      labels.push(balance.symbol || `Token ${index + 1}`);
      dataValues.push(balance.value_usd);
    } else {
      otherValue += balance.value_usd;
    }
  });

  // Add 'Other' category if needed
  if (otherValue > 0) {
    labels.push('Other');
    dataValues.push(otherValue);
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'USD Value',
        data: dataValues,
        backgroundColor: backgroundColors.slice(0, dataValues.length),
        hoverBackgroundColor: backgroundColors.slice(0, dataValues.length),
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Top ${Math.min(topN, sortedBalances.length)} Token Value Distribution (USD)`,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
                // Format as currency
                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed);
            }
            return label;
          }
        }
      }
    },
  };

  console.log('Chart data prepared:', chartData);

  return (
    <div className="chart-container">
      <Pie data={chartData} options={options} />
    </div>
  );
}

export default BalanceChart; 