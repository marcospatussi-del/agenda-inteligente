import React from 'react';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function ProductivityCharts({ categoryData = [], occupiedHours = 0, freeHours = 8, productivityScore = 100 }) {
  const timeData = [
    { name: 'Horas Ocupadas', hours: occupiedHours, fill: '#6750A4' },
    { name: 'Tempo Livre', hours: freeHours, fill: '#81C784' },
  ];

  return (
    <Grid container spacing={3}>
      {/* Category Distribution Chart */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              📊 Compromissos por Categoria
            </Typography>

            {categoryData.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                Nenhum compromisso cadastrado para exibir no gráfico.
              </Typography>
            ) : (
              <Box sx={{ width: '100%', height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#6750A4'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value, name) => [`${value} compromisso(s)`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Time & Productivity Bar Chart */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              ⏳ Horas Ocupadas vs Tempo Livre
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
              Índice de Produtividade Diária: <strong>{productivityScore}%</strong>
            </Typography>

            <Box sx={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" unit="h" />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px' }}
                    formatter={(value) => [`${value} horas`, 'Tempo']}
                  />
                  <Bar dataKey="hours" radius={[0, 12, 12, 0]}>
                    {timeData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
