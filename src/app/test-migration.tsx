export default function TestMigration() {
    return (
      <div className="p-8 space-y-4">
        <h1>Current Classes Test</h1>
        
        {/* Test current classes */}
        <div className="bg-primary text-primary p-4 rounded-md">
          Current: bg-primary text-primary
        </div>
        
        {/* Test what we want */}
        <div className="bg-primary text-primary p-4 rounded-md">
          Desired: bg-primary text-primary
        </div>
        
        {/* Interactive button test */}
        <button className="bg-interactive-primary-default hover:bg-interactive-primary-hover text-interactive-default px-4 py-2 rounded-md">
          Current Button
        </button>
      </div>
    );
  }