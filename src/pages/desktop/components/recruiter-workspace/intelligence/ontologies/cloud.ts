/**
 * Resume Intelligence OS v3.0 — Cloud Ontology
 */
import type { OntologyModule } from './registry';

export const cloudOntology: OntologyModule = {
  id: 'cloud', displayName: 'Cloud & DevOps', version: '1.0.0',
  entries: [
    { canonical: 'Amazon Web Services', aliases: ['AWS', 'Amazon AWS', 'Amazon Cloud'], parentCategory: 'Cloud Platform', grandparentCategory: 'Cloud', skillType: 'PlatformSkill', taxonomy: ['Cloud', 'Cloud Platform', 'AWS'] },
    { canonical: 'Microsoft Azure', aliases: ['Azure', 'MS Azure', 'Windows Azure', 'Azure Cloud'], parentCategory: 'Cloud Platform', grandparentCategory: 'Cloud', skillType: 'PlatformSkill', taxonomy: ['Cloud', 'Cloud Platform', 'Azure'] },
    { canonical: 'Google Cloud Platform', aliases: ['GCP', 'Google Cloud', 'GCS'], parentCategory: 'Cloud Platform', grandparentCategory: 'Cloud', skillType: 'PlatformSkill', taxonomy: ['Cloud', 'Cloud Platform', 'GCP'] },
    { canonical: 'Kubernetes', aliases: ['K8s', 'K8', 'Kube', 'Container Orchestration'], parentCategory: 'Container Orchestration', grandparentCategory: 'Cloud', skillType: 'TechnicalSkill', taxonomy: ['Cloud', 'Containers', 'Orchestration', 'Kubernetes'] },
    { canonical: 'Docker', aliases: ['Docker Container', 'Containerization', 'Docker Compose'], parentCategory: 'Containers', grandparentCategory: 'Cloud', skillType: 'TechnicalSkill', taxonomy: ['Cloud', 'Containers', 'Docker'] },
    { canonical: 'Terraform', aliases: ['HashiCorp Terraform', 'IaC Terraform', 'Infrastructure as Code'], parentCategory: 'IaC', grandparentCategory: 'Cloud', skillType: 'TechnicalSkill', taxonomy: ['Cloud', 'DevOps', 'IaC', 'Terraform'] },
    { canonical: 'CI/CD', aliases: ['Continuous Integration', 'Continuous Delivery', 'CD/CI', 'CI CD Pipeline'], parentCategory: 'DevOps', grandparentCategory: 'Software Engineering', skillType: 'DomainSkill', taxonomy: ['Software Engineering', 'DevOps', 'CI/CD'] },
    { canonical: 'Jenkins', aliases: ['Jenkins CI', 'Jenkins Pipeline'], parentCategory: 'CI/CD Tool', grandparentCategory: 'DevOps', skillType: 'ToolSkill', taxonomy: ['DevOps', 'CI/CD', 'Jenkins'] },
    { canonical: 'Azure Active Directory', aliases: ['AAD', 'Entra ID', 'Azure AD', 'Microsoft Entra'], parentCategory: 'Identity', grandparentCategory: 'Azure', skillType: 'PlatformSkill', taxonomy: ['Cloud', 'Azure', 'Identity', 'Azure AD'] },
    { canonical: 'Azure Intune', aliases: ['Intune', 'Microsoft Intune', 'MDM Intune', 'Endpoint Manager'], parentCategory: 'Device Management', grandparentCategory: 'Azure', skillType: 'PlatformSkill', taxonomy: ['Cloud', 'Azure', 'Endpoint Management', 'Intune'] },
    { canonical: 'Microsoft Defender', aliases: ['Defender for Endpoint', 'Microsoft Defender ATP', 'MDE'], parentCategory: 'Security', grandparentCategory: 'Microsoft', skillType: 'PlatformSkill', taxonomy: ['Security', 'Microsoft', 'Defender'] },
    { canonical: 'AWS Lambda', aliases: ['Lambda', 'Serverless AWS', 'FaaS Lambda'], parentCategory: 'Serverless', grandparentCategory: 'AWS', skillType: 'TechnicalSkill', taxonomy: ['Cloud', 'AWS', 'Serverless', 'Lambda'] },
    { canonical: 'AWS EKS', aliases: ['EKS', 'Elastic Kubernetes Service'], parentCategory: 'Container Orchestration', grandparentCategory: 'AWS', skillType: 'TechnicalSkill', taxonomy: ['Cloud', 'AWS', 'Kubernetes', 'EKS'] },
    { canonical: 'GitHub Actions', aliases: ['GH Actions', 'GitHub CI/CD'], parentCategory: 'CI/CD Tool', grandparentCategory: 'DevOps', skillType: 'ToolSkill', taxonomy: ['DevOps', 'CI/CD', 'GitHub Actions'] },
    { canonical: 'Ansible', aliases: ['Ansible Automation', 'Ansible Playbook'], parentCategory: 'IaC', grandparentCategory: 'DevOps', skillType: 'TechnicalSkill', taxonomy: ['DevOps', 'IaC', 'Ansible'] },
    { canonical: 'Helm', aliases: ['Helm Charts', 'Kubernetes Helm'], parentCategory: 'Kubernetes Tools', grandparentCategory: 'Cloud', skillType: 'ToolSkill', taxonomy: ['Cloud', 'Kubernetes', 'Helm'] },
  ],
};
