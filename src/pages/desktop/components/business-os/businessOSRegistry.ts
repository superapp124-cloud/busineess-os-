/**
 * businessOSRegistry.ts
 * 
 * Central SDK Registry for Business OS.
 * Extracted from BusinessOS.tsx to keep the main file lean and allow
 * individual SDK imports to be tree-shaken per capability.
 * 
 * Expose via window.__CHATR_SDK_REGISTRY__ so Kernel Runtimes
 * (StateMachine, PolicyEngine) can dynamically discover installed SDKs.
 */

import { LeadManagementSDK } from '@/sdk/capabilities/LeadManagement.sdk';
import { OKRSDK } from '@/sdk/capabilities/OKR.sdk';
import { ExecutiveCEOOfficeSDK } from '@/sdk/capabilities/Executive.CEOOffice.sdk';
import { ExecutiveStrategicPlanningSDK } from '@/sdk/capabilities/Executive.StrategicPlanning.sdk';
import { ExecutiveBoardManagementSDK } from '@/sdk/capabilities/Executive.BoardManagement.sdk';
import { ExecutiveRiskManagementSDK } from '@/sdk/capabilities/Executive.RiskManagement.sdk';
import { ExecutiveDecisionTrackerSDK } from '@/sdk/capabilities/Executive.DecisionTracker.sdk';
import { CRMOpportunityManagementSDK } from '@/sdk/capabilities/CRM.OpportunityManagement.sdk';
import { CRMAccountsSDK } from '@/sdk/capabilities/CRM.Accounts.sdk';
import { CRMContactsSDK } from '@/sdk/capabilities/CRM.Contacts.sdk';
import { CRMSalesPipelineSDK } from '@/sdk/capabilities/CRM.SalesPipeline.sdk';
import { CRMQuotationsSDK } from '@/sdk/capabilities/CRM.Quotations.sdk';
import { CRMCustomerSuccessSDK } from '@/sdk/capabilities/CRM.CustomerSuccess.sdk';
import { HRATSSDK } from '@/sdk/capabilities/HR.ATS.sdk';
import { HREmployeeDirectorySDK } from '@/sdk/capabilities/HR.EmployeeDirectory.sdk';
import { HRAttendanceSDK } from '@/sdk/capabilities/HR.Attendance.sdk';
import { HRLeaveManagementSDK } from '@/sdk/capabilities/HR.LeaveManagement.sdk';
import { HRPerformanceReviewsSDK } from '@/sdk/capabilities/HR.PerformanceReviews.sdk';
import { HROnboardingSDK } from '@/sdk/capabilities/HR.Onboarding.sdk';
import { FinanceExpensesSDK } from '@/sdk/capabilities/Finance.Expenses.sdk';
import { FinanceInvoicingSDK } from '@/sdk/capabilities/Finance.Invoicing.sdk';
import { FinancePurchaseOrdersSDK } from '@/sdk/capabilities/Finance.PurchaseOrders.sdk';
import { FinanceBudgetingSDK } from '@/sdk/capabilities/Finance.Budgeting.sdk';
import { MarketingCampaignManagementSDK } from '@/sdk/capabilities/Marketing.CampaignManagement.sdk';
import { MarketingEmailMarketingSDK } from '@/sdk/capabilities/Marketing.EmailMarketing.sdk';
import { MarketingSocialPublishingSDK } from '@/sdk/capabilities/Marketing.SocialPublishing.sdk';
import { OperationsProjectManagementSDK } from '@/sdk/capabilities/Operations.ProjectManagement.sdk';
import { OperationsInventoryManagementSDK } from '@/sdk/capabilities/Operations.InventoryManagement.sdk';
import { SupportHelpdeskSDK } from '@/sdk/capabilities/Support.Helpdesk.sdk';
import { SupportKnowledgeBaseSDK } from '@/sdk/capabilities/Support.KnowledgeBase.sdk';
import { CommunicationAnnouncementsSDK } from '@/sdk/capabilities/Communication.Announcements.sdk';
import { CommunicationMeetingRoomsSDK } from '@/sdk/capabilities/Communication.MeetingRooms.sdk';
import { AIWorkflowAutomationSDK } from '@/sdk/capabilities/AI.WorkflowAutomation.sdk';
import { AIIntentEngineSDK } from '@/sdk/capabilities/AI.IntentEngine.sdk';
import { PlatformIdentityAccessSDK } from '@/sdk/capabilities/Platform.IdentityAccess.sdk';
import { PlatformAnalyticsSDK } from '@/sdk/capabilities/Platform.Analytics.sdk';

/** Maps capability id → full SDK object */
export const SDK_REGISTRY: Record<string, any> = {
  'CRM.LeadManagement': LeadManagementSDK,
  'Executive.OKRGoals': OKRSDK,
  'Executive.CEOOffice': ExecutiveCEOOfficeSDK,
  'Executive.StrategicPlanning': ExecutiveStrategicPlanningSDK,
  'Executive.BoardManagement': ExecutiveBoardManagementSDK,
  'Executive.RiskManagement': ExecutiveRiskManagementSDK,
  'Executive.DecisionTracker': ExecutiveDecisionTrackerSDK,
  'CRM.OpportunityManagement': CRMOpportunityManagementSDK,
  'CRM.Accounts': CRMAccountsSDK,
  'CRM.Contacts': CRMContactsSDK,
  'CRM.SalesPipeline': CRMSalesPipelineSDK,
  'CRM.Quotations': CRMQuotationsSDK,
  'CRM.CustomerSuccess': CRMCustomerSuccessSDK,
  'HR.ATS': HRATSSDK,
  'HR.EmployeeDirectory': HREmployeeDirectorySDK,
  'HR.Attendance': HRAttendanceSDK,
  'HR.LeaveManagement': HRLeaveManagementSDK,
  'HR.PerformanceReviews': HRPerformanceReviewsSDK,
  'HR.Onboarding': HROnboardingSDK,
  'Finance.Expenses': FinanceExpensesSDK,
  'Finance.Invoicing': FinanceInvoicingSDK,
  'Finance.PurchaseOrders': FinancePurchaseOrdersSDK,
  'Finance.Budgeting': FinanceBudgetingSDK,
  'Marketing.CampaignManagement': MarketingCampaignManagementSDK,
  'Marketing.EmailMarketing': MarketingEmailMarketingSDK,
  'Marketing.SocialPublishing': MarketingSocialPublishingSDK,
  'Operations.ProjectManagement': OperationsProjectManagementSDK,
  'Operations.InventoryManagement': OperationsInventoryManagementSDK,
  'Support.Helpdesk': SupportHelpdeskSDK,
  'Support.KnowledgeBase': SupportKnowledgeBaseSDK,
  'Communication.Announcements': CommunicationAnnouncementsSDK,
  'Communication.MeetingRooms': CommunicationMeetingRoomsSDK,
  'AI.WorkflowAutomation': AIWorkflowAutomationSDK,
  'AI.IntentEngine': AIIntentEngineSDK,
  'Platform.IdentityAccess': PlatformIdentityAccessSDK,
  'Platform.Analytics': PlatformAnalyticsSDK,
};

// Auto-register with global runtime if available
if (typeof window !== 'undefined') {
  (window as any).__CHATR_SDK_REGISTRY__ = SDK_REGISTRY;
}
