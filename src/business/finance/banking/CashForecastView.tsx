import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, RefreshCw, Landmark, ArrowUpRight, ArrowDownRight, ShieldCheck, DollarSign } from 'lucide-react';
import { formatCurrency } from '../types';

interface CashForecastViewProps {
  finOrganizationId: string;
}

export function CashForecastView({ finOrganizationId }: CashForecastViewProps) {
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadForecast = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.rpc('fin_calculate_90_day_cash_forecast', {
      p_org_id: finOrganizationId
    });
    setForecast(data);
    setLoading(false);
  }, [finOrganizationId]);

  useEffect(() => {
    loadForecast();
  }, [loadForecast]);

  const actualCash = forecast?.actual_cash || 0;
  const day30 = forecast?.day_30 || {};
  const day60 = forecast?.day_60 || {};
  const day90 = forecast?.day_90 || {};

  return (
    <div className="space-y-4">
      {/* Top Banner: Liquidity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="p-3.5 bg-green-50/50 border-green-200">
          <p className="text-[11px] text-green-900 font-medium">Actual Bank Cash Balance</p>
          <p className="text-base font-bold font-mono text-green-950 mt-1">
            {formatCurrency(actualCash, 'INR')}
          </p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[11px] text-muted-foreground">Projected 30-Day Cash Position</p>
          <p className="text-base font-bold font-mono text-foreground mt-1">
            {formatCurrency(day30.net_cash_position || 0, 'INR')}
          </p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[11px] text-muted-foreground">Projected 60-Day Cash Position</p>
          <p className="text-base font-bold font-mono text-foreground mt-1">
            {formatCurrency(day60.net_cash_position || 0, 'INR')}
          </p>
        </Card>
        <Card className="p-3.5">
          <p className="text-[11px] text-muted-foreground">Projected 90-Day Cash Position</p>
          <p className="text-base font-bold font-mono text-foreground mt-1">
            {formatCurrency(day90.net_cash_position || 0, 'INR')}
          </p>
        </Card>
      </div>

      {/* 90-Day Cash Flow Waterfall Card */}
      <Card>
        <CardHeader className="py-3 px-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-green-600" />
              90-Day Predictive Cash Flow Horizon
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={loadForecast}>
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Horizon 1: 1-30 Days */}
            <div className="p-3.5 rounded-lg border bg-muted/20 space-y-2.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Days 1 to 30</span>
                <Badge variant="outline" className="text-[10px]">Short-Term</Badge>
              </div>
              <div className="space-y-1 pt-1 border-t">
                <div className="flex justify-between text-green-700">
                  <span>Expected Inflows (AR Due):</span>
                  <span className="font-mono">+{formatCurrency(day30.inflows || 0, 'INR')}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Expected Outflows (Bills Due):</span>
                  <span className="font-mono">-{formatCurrency(day30.outflows || 0, 'INR')}</span>
                </div>
                <div className="flex justify-between font-bold pt-1.5 border-t text-foreground">
                  <span>Net Ending Cash:</span>
                  <span className="font-mono">{formatCurrency(day30.net_cash_position || 0, 'INR')}</span>
                </div>
              </div>
            </div>

            {/* Horizon 2: 31-60 Days */}
            <div className="p-3.5 rounded-lg border bg-muted/20 space-y-2.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Days 31 to 60</span>
                <Badge variant="outline" className="text-[10px]">Mid-Term</Badge>
              </div>
              <div className="space-y-1 pt-1 border-t">
                <div className="flex justify-between text-green-700">
                  <span>Expected Inflows:</span>
                  <span className="font-mono">+{formatCurrency(day60.inflows || 0, 'INR')}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Expected Outflows:</span>
                  <span className="font-mono">-{formatCurrency(day60.outflows || 0, 'INR')}</span>
                </div>
                <div className="flex justify-between font-bold pt-1.5 border-t text-foreground">
                  <span>Net Ending Cash:</span>
                  <span className="font-mono">{formatCurrency(day60.net_cash_position || 0, 'INR')}</span>
                </div>
              </div>
            </div>

            {/* Horizon 3: 61-90 Days */}
            <div className="p-3.5 rounded-lg border bg-muted/20 space-y-2.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-foreground">
                <span>Days 61 to 90</span>
                <Badge variant="outline" className="text-[10px]">Strategic</Badge>
              </div>
              <div className="space-y-1 pt-1 border-t">
                <div className="flex justify-between text-green-700">
                  <span>Expected Inflows:</span>
                  <span className="font-mono">+{formatCurrency(day90.inflows || 0, 'INR')}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Expected Outflows:</span>
                  <span className="font-mono">-{formatCurrency(day90.outflows || 0, 'INR')}</span>
                </div>
                <div className="flex justify-between font-bold pt-1.5 border-t text-foreground">
                  <span>Net Ending Cash:</span>
                  <span className="font-mono">{formatCurrency(day90.net_cash_position || 0, 'INR')}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
