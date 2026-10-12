import { Typography, useTheme } from "@mui/material";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useFormatCurrency } from "../../contexts";
import * as S from "./styles";

export interface ChartItem {
  name: string;
  emoji: string;
  value: number;
  color: string;
}

const renderEmoji = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  emoji,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  emoji: string;
}) => {
  const radius = outerRadius + 18;
  const angle = -midAngle * (Math.PI / 180);
  return (
    <text
      x={cx + radius * Math.cos(angle)}
      y={cy + radius * Math.sin(angle)}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="16"
    >
      {emoji}
    </text>
  );
};

interface MonthChartProps {
  items: ChartItem[];
}

const MonthChart = ({ items }: MonthChartProps) => {
  const theme = useTheme();
  const formatMoney = useFormatCurrency();
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <S.ChartWrap>
      {items.length === 0 ? (
        <S.EmptyRing />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              nameKey="emoji"
              label={renderEmoji}
              labelLine={false}
              innerRadius="44%"
              outerRadius="64%"
              paddingAngle={items.length > 1 ? 2 : 0}
              startAngle={90}
              endAngle={-270}
              stroke={theme.palette.background.default}
              strokeWidth={2}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            >
              {items.map((item, index) => (
                <Cell key={`${item.name}-${index}`} fill={item.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatMoney(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      )}
      <S.ChartCenter>
        <Typography variant="body2" color="text.secondary">
          Total
        </Typography>
        <Typography variant="subtitle1">{formatMoney(total)}</Typography>
      </S.ChartCenter>
    </S.ChartWrap>
  );
};

export default MonthChart;
