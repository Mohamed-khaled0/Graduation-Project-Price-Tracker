import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface PricePoint {
  dateLabel: string;
  price: number;
  actualDate: Date;
}

interface PriceForecastChartProps {
  currentPrice: number;
  productName: string;
}

const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const PriceForecastChart: React.FC<PriceForecastChartProps> = ({ currentPrice, productName }) => {

  const generateChartData = (): PricePoint[] => {
    const historicalPointsCount = 6;
    const rawData: { date: Date; price: number }[] = [];
    const currentDate = new Date();

    let seed = 0;
    for (let i = 0; i < productName.length; i++) {
      seed += productName.charCodeAt(i);
    }
    seed += currentPrice;

    for (let i = 0; i < historicalPointsCount; i++) {
      const randomDaysAgo = Math.floor(seededRandom(seed + i * 11) * 180) + 1;
      const historicalDate = new Date(currentDate);
      historicalDate.setDate(currentDate.getDate() - randomDaysAgo);

      const variationPercent = (seededRandom(seed + i * 17 + 3) * 0.30) - 0.15;
      const historicalPrice = currentPrice * (1 + variationPercent);

      rawData.push({
        date: historicalDate,
        price: Number(historicalPrice.toFixed(2)),
      });
    }

    rawData.sort((a, b) => a.date.getTime() - b.date.getTime());

    const chartData: PricePoint[] = rawData.map(item => ({
      dateLabel: item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: item.price,
      actualDate: item.date
    }));

    chartData.push({
      dateLabel: 'Current',
      price: currentPrice,
      actualDate: currentDate
    });

    return chartData;
  };

  const data = useMemo(() => generateChartData(), [currentPrice, productName]);

  return (
    <div className="w-full h-[300px] sm:h-[400px] mt-8 p-4 bg-white rounded-xl border border-gray-200">
      <h3 className="text-lg sm:text-xl font-semibold text-[#39536f] mb-4">
        Price History
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dateLabel"
            stroke="#6f7d95"
            tick={{ fill: '#6f7d95' }}
          />
          <YAxis
            stroke="#6f7d95"
            tick={{ fill: '#6f7d95' }}
            tickFormatter={(value) => `EGP ${value.toLocaleString('en-US')}`}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: number, name: string, props: any) => {
              return [`EGP ${props.payload.price.toLocaleString('en-US')}`, name];
            }}
            labelFormatter={(label: string) => {
              return label;
            }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#39536f"
            strokeWidth={2}
            dot={{ fill: '#39536f', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            name="Price"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceForecastChart;
