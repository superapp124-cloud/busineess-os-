import { CapabilityBuilder } from '@chatr/sdk';

export const recruitmentManifest = new CapabilityBuilder()
  .name('recruitment-os')
  .version(1, 0, 0)
  .publisher('chatr', 'CHATR Core')
  .minimumKernelVersion(1, 0, 0)
  .status('ENABLED')
  .addAction({
    id: 'Recruitment.SourceCandidates',
    name: 'Source Candidates',
    description: 'Sources candidates from LinkedIn and GitHub matching job criteria',
    inputSchema: { type: 'object', properties: { roleTitle: { type: 'string' }, skills: { type: 'array' } } },
    outputSchema: { type: 'object', properties: { candidatesFound: { type: 'number' }, candidateIds: { type: 'array' } } }
  })
  .addAction({
    id: 'Recruitment.ScreenCandidate',
    name: 'Screen Candidate',
    description: 'Runs AI resume screening and generates score and summary',
    inputSchema: { type: 'object', properties: { candidateId: { type: 'string' }, jobDescription: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { aiScore: { type: 'number' }, fitSummary: { type: 'string' }, recommendedStage: { type: 'string' } } }
  })
  .addAction({
    id: 'Recruitment.ScheduleInterview',
    name: 'Schedule Interview',
    description: 'Finds mutual calendar availability and sends interview invite',
    inputSchema: { type: 'object', properties: { candidateEmail: { type: 'string' }, interviewerEmails: { type: 'array' } } },
    outputSchema: { type: 'object', properties: { interviewId: { type: 'string' }, scheduledTime: { type: 'string' } } }
  })
  .addAction({
    id: 'Recruitment.GenerateOfferLetter',
    name: 'Generate Offer Letter',
    description: 'Drafts customized employment offer letter with salary details',
    inputSchema: { type: 'object', properties: { candidateName: { type: 'string' }, ctcAnnual: { type: 'number' }, joiningDate: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { offerLetterDocId: { type: 'string' }, pdfUrl: { type: 'string' } } }
  })
  .build();
