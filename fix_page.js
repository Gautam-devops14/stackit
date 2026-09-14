const fs = require('fs');
let code = fs.readFileSync('src/app/questions/[id]/page.tsx', 'utf8');

code = code.replace(
  /<span>by <span className="font-medium text-primary">@{question.profiles\?.username}<\/span><\/span>/g,
  '<span>by <Link href={`/users/${question.profiles?.username}`} className="font-medium text-primary hover:underline">@{question.profiles?.username}</Link></span>'
);

code = code.replace(
  /Answered by <span className="font-medium text-primary">@{answer.profiles\?.username}<\/span>/g,
  'Answered by <Link href={`/users/${answer.profiles?.username}`} className="font-medium text-primary hover:underline">@{answer.profiles?.username}</Link>'
);

code = code.replace(
  /– <span className="text-primary">@{comment.profiles\?.username}<\/span>/g,
  '– <Link href={`/users/${comment.profiles?.username}`} className="text-primary hover:underline">@{comment.profiles?.username}</Link>'
);

fs.writeFileSync('src/app/questions/[id]/page.tsx', code);
