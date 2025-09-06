'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export default function DashboardCharts({ userData, downloadData,locationData }) {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      {/* New User Registrations Chart */}
      <div className='w-full h-96 bg-white p-4 rounded-lg shadow-md'>
        <h2 className='text-lg font-semibold mb-4'>New User Registrations</h2>
        <ResponsiveContainer width='100%' height='80%'>
          <LineChart
            data={userData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type='monotone'
              dataKey='value'
              stroke='#8884d8'
              activeDot={{ r: 8 }}
              name='New Users'
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Product Downloads Chart */}
      <div className='w-full h-96 bg-white p-4 rounded-lg shadow-md'>
        <h2 className='text-lg font-semibold mb-4'>Product Downloads</h2>
        <ResponsiveContainer width='100%' height='80%'>
          <LineChart
            data={downloadData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='date' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type='monotone'
              dataKey='value'
              stroke='#82ca9d'
              activeDot={{ r: 8 }}
              name='Downloads'
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* User Location Distribution */}
      <div className='w-full h-96 bg-white p-4 rounded-lg shadow-md'>
        <h2 className='text-lg font-semibold mb-4'>Users by Country</h2>
        <ResponsiveContainer width='100%' height='80%'>
          <LineChart
            data={locationData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='country' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type='monotone'
              dataKey='value'
              stroke='#ff7f50'
              name='Users'
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
