import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Cloud, 
  Server, 
  Database, 
  Terminal, 
  Copy, 
  Check, 
  FileCode, 
  ShieldCheck,
  Code2,
  ExternalLink
} from 'lucide-react';
import { DEFAULT_API_BASE_URL } from '../config.ts';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [showLambdaReference, setShowLambdaReference] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const curlVerify = `curl -X GET "${DEFAULT_API_BASE_URL}/verify?id=CERT-2026-001"`;

  const curlRegister = `curl -X POST "${DEFAULT_API_BASE_URL}/register" \\
  -H "Content-Type: application/json" \\
  -H "X-Admin-Key: YOUR_ADMIN_KEY" \\
  -d '{
    "studentName": "Alex Mercer",
    "course": "AWS Cloud Architecture",
    "institution": "Stanford University",
    "issueDate": "2026-10-26"
  }'`;

  const curlRevoke = `curl -X POST "${DEFAULT_API_BASE_URL}/revoke" \\
  -H "Content-Type: application/json" \\
  -H "X-Admin-Key: YOUR_ADMIN_KEY" \\
  -d '{
    "id": "CERT-2026-001"
  }'`;

  const s3BuildCommand = `# Step 1: Build the production static distribution
npm run build

# Step 2: Sync the static files to your Amazon S3 bucket
aws s3 sync dist/ s3://YOUR_S3_BUCKET_NAME/ --delete

# Step 3 (Optional if bucket is public): Set bucket policy for static web hosting`;

  const lambdaReferenceCode = `import json
import boto3
import uuid
import os
from datetime import datetime

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
table = dynamodb.Table('CertificateRecords')
ADMIN_KEY = os.environ.get('ADMIN_KEY', 'your-secret-admin-key')

def lambda_handler(event, context):
    path = event.get('rawPath') or event.get('path', '')
    method = event.get('requestContext', {}).get('http', {}).get('method') or event.get('httpMethod', '')
    headers = event.get('headers') or {}
    
    # 1. CORS headers
    cors_headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'content-type,x-admin-key',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    }
    
    if method == 'OPTIONS':
        return {'statusCode': 204, 'headers': cors_headers, 'body': ''}
        
    # Helper to authenticate admin
    def check_admin():
        # Check case-insensitively
        key = None
        for k, v in headers.items():
            if k.lower() == 'x-admin-key':
                key = v
                break
        return key == ADMIN_KEY

    # 2. ROUTE: GET /verify
    if method == 'GET' and path.endswith('/verify'):
        params = event.get('queryStringParameters') or {}
        cert_id = params.get('id', '').strip()
        if not cert_id:
            return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'Missing id query parameter'})}
            
        res = table.get_item(Key={'certificateId': cert_id})
        item = res.get('Item')
        if not item:
            return {'statusCode': 404, 'headers': cors_headers, 'body': json.dumps({'status': 'NOT FOUND', 'certificateId': cert_id, 'message': 'No certificate exists with this ID.'})}
            
        return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps(item)}

    # 3. ROUTE: POST /register
    if method == 'POST' and path.endswith('/register'):
        if not check_admin():
            return {'statusCode': 401, 'headers': cors_headers, 'body': json.dumps({'error': 'Unauthorized: invalid administrator key'})}
            
        body = event.get('body')
        if isinstance(body, str):
            body = json.loads(body) if body else {}
        elif not body:
            body = {}
            
        student_name = body.get('studentName') or body.get('student_name')
        course = body.get('course')
        institution = body.get('institution')
        issue_date = body.get('issueDate') or body.get('issue_date') or str(datetime.now().date())
        
        if not student_name or not course or not institution:
            return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'Missing required fields'})}
            
        cert_id = body.get('certificateId') or f"CERT-{uuid.uuid4().hex[:8].upper()}"
        
        # Save to DynamoDB with partition key: certificateId
        item = {
            'certificateId': cert_id,
            'studentName': student_name,
            'course': course,
            'institution': institution,
            'issueDate': issue_date,
            'status': 'VALID',
            'createdAt': str(datetime.now())
        }
        table.put_item(Item=item)
        
        return {
            'statusCode': 200,
            'headers': cors_headers,
            'body': json.dumps({
                'message': 'Certificate registered successfully',
                'certificateId': cert_id,
                'status': 'VALID'
            })
        }

    # 4. ROUTE: POST /revoke
    if method == 'POST' and path.endswith('/revoke'):
        if not check_admin():
            return {'statusCode': 401, 'headers': cors_headers, 'body': json.dumps({'error': 'Unauthorized: invalid administrator key'})}
            
        body = event.get('body')
        if isinstance(body, str):
            body = json.loads(body) if body else {}
            
        cert_id = body.get('id') or body.get('certificateId')
        if not cert_id:
            return {'statusCode': 400, 'headers': cors_headers, 'body': json.dumps({'error': 'Missing certificate ID'})}
            
        table.update_item(
            Key={'certificateId': cert_id},
            UpdateExpression="SET #st = :val, revokedAt = :time",
            ExpressionAttributeNames={'#st': 'status'},
            ExpressionAttributeValues={':val': 'REVOKED', ':time': str(datetime.now())}
        )
        return {'statusCode': 200, 'headers': cors_headers, 'body': json.dumps({'message': f'Certificate {cert_id} revoked successfully', 'status': 'REVOKED'})}

    return {'statusCode': 404, 'headers': cors_headers, 'body': json.dumps({'error': 'Not found'})}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                AWS Architecture & S3 Export Guide
              </h2>
              <p className="text-xs text-slate-500">
                Cloud Computing Microproject Specifications & Deployment Instructions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AWS Backend Contract */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-600" />
            <span>1. AWS Lambda & API Gateway Contract</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            CertiVerify connects to your live AWS API Gateway HTTP API at <code className="font-mono text-blue-700 font-bold">{DEFAULT_API_BASE_URL}</code>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-emerald-700 font-mono block">GET /verify</span>
              <p className="text-slate-600 text-[11px]">Query param: <code className="font-mono">?id=CERT_ID</code></p>
              <p className="text-slate-500 text-[11px]">Returns 200 with certificate object, or 404 NOT FOUND.</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-blue-700 font-mono block">POST /register</span>
              <p className="text-slate-600 text-[11px]">Header: <code className="font-mono">X-Admin-Key</code></p>
              <p className="text-slate-500 text-[11px]">Returns <code className="font-mono text-blue-700">{"{\"certificateId\": \"...\"}"}</code></p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-rose-700 font-mono block">POST /revoke</span>
              <p className="text-slate-600 text-[11px]">Header: <code className="font-mono">X-Admin-Key</code></p>
              <p className="text-slate-500 text-[11px]">Updates status to REVOKED in DynamoDB.</p>
            </div>
          </div>

          {/* Reference Lambda Implementation Toggle */}
          <div className="pt-2">
            <button
              onClick={() => setShowLambdaReference(!showLambdaReference)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showLambdaReference ? 'Hide Reference Lambda Code' : 'View Reference Python Lambda Handler (CertificateVerificationAPI)'}</span>
            </button>

            {showLambdaReference && (
              <div className="mt-3 relative">
                <pre className="p-4 bg-slate-900 rounded-xl text-slate-200 text-[11px] font-mono overflow-x-auto max-h-72 leading-relaxed">
                  {lambdaReferenceCode}
                </pre>
                <button
                  onClick={() => handleCopy(lambdaReferenceCode, 'lambda')}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-sans flex items-center gap-1"
                >
                  {copiedIndex === 'lambda' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIndex === 'lambda' ? 'Copied' : 'Copy Python'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* API Gateway CORS Reminder */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-800">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>API Gateway CORS Configuration</span>
          </div>
          <p className="leading-relaxed">
            Ensure your Amazon API Gateway HTTP API has CORS enabled for browser calls:
          </p>
          <div className="font-mono text-[11px] bg-white p-2 rounded border border-blue-200 space-y-1 text-slate-800">
            <div><strong>Access-Control-Allow-Origin:</strong> *</div>
            <div><strong>Access-Control-Allow-Headers:</strong> content-type, x-admin-key</div>
            <div><strong>Access-Control-Allow-Methods:</strong> GET, POST, OPTIONS</div>
          </div>
        </div>

        {/* Amazon S3 Static Website Hosting Export */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-amber-600" />
            <span>2. How to Export & Deploy to Amazon S3</span>
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            CertiVerify builds into pure static assets (<code className="font-mono">index.html</code>, JavaScript, CSS). It does not require Node.js runtime on the hosting server, making it ideal for Amazon S3 Static Website Hosting.
          </p>

          <div className="relative">
            <pre className="p-4 bg-slate-900 rounded-xl text-slate-200 text-xs font-mono overflow-x-auto leading-relaxed">
              {s3BuildCommand}
            </pre>
            <button
              onClick={() => handleCopy(s3BuildCommand, 's3')}
              className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-sans flex items-center gap-1"
            >
              {copiedIndex === 's3' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedIndex === 's3' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">S3 Static Website Configuration:</span>
            <ul className="list-disc pl-5 space-y-1 text-[11px]">
              <li><strong>Index document:</strong> <code className="font-mono">index.html</code></li>
              <li><strong>Error document:</strong> <code className="font-mono">index.html</code> (enables client routing and <code className="font-mono">?id=...</code> query handling)</li>
            </ul>
          </div>
        </div>

        {/* cURL Commands to Test Endpoints */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-700" />
            <span>3. Terminal cURL Verification Commands</span>
          </h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Test GET /verify:</span>
              <button
                onClick={() => handleCopy(curlVerify, 'verify')}
                className="text-blue-600 hover:text-blue-800 text-[11px] flex items-center gap-1"
              >
                {copiedIndex === 'verify' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedIndex === 'verify' ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 rounded-xl text-slate-200 text-[11px] font-mono overflow-x-auto">
              {curlVerify}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Test POST /register:</span>
              <button
                onClick={() => handleCopy(curlRegister, 'register')}
                className="text-blue-600 hover:text-blue-800 text-[11px] flex items-center gap-1"
              >
                {copiedIndex === 'register' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedIndex === 'register' ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 rounded-xl text-slate-200 text-[11px] font-mono overflow-x-auto">
              {curlRegister}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Test POST /revoke:</span>
              <button
                onClick={() => handleCopy(curlRevoke, 'revoke')}
                className="text-blue-600 hover:text-blue-800 text-[11px] flex items-center gap-1"
              >
                {copiedIndex === 'revoke' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedIndex === 'revoke' ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 rounded-xl text-slate-200 text-[11px] font-mono overflow-x-auto">
              {curlRevoke}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
